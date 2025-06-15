import redis from "../queue/redis";
import logger from "../utils/logger";
import ExecutorFactory from "../executors/executor.factory";
import {
    JOB_QUEUE,
    jobMetaKey,
    jobDataKey,
    MAX_RETRIES,
    BASE_BACKOFF_MS,
    DEAD_LETTER_QUEUE
} from "../lib/constants";

class Worker{
    async processJob(): Promise<void> {
        try{
            const jobIdRequest = await redis.brpop(JOB_QUEUE, 5);

            if (!jobIdRequest) {
                console.log('📛 Queue might be empty or unknown error!');
                return;
            }

            const jobId = jobIdRequest[1];

            //retrieveing job metadata - status, timepoints etc
            const jobMeta = await redis.hgetall(jobMetaKey(jobId));

            //retrieving job data - the actual payload
            const job = await redis.hgetall(jobDataKey(jobId));

            //apparently redis stores stuff as strings only, I stringified args while setting it into redis so now we parse 
            if (job.args) {
                job.args = JSON.parse(job.args);  
            }


            jobMeta.status = 'processing'
            jobMeta.startedAt = Date.now().toString();
            await redis.hset(jobMetaKey(jobId), jobMeta);

            logger.info(`🛠️  Processing job: ${jobId}`);

            let success = false;
            let output: string | undefined;
            let error: string | undefined;

            //Calling the executioner with the strategy - executioner follows a factory + strategy approach
            try {
                const Executioner = ExecutorFactory.create(job.type);

                const jobResults = await Executioner.execute(job);
                success = jobResults.success;
                output = jobResults.output;
                error = jobResults.error;

                logger.info(`✅ Job execution completed: ${jobId}`);
                logger.info({
                    success,
                    output,
                    error
                })
            } catch (err) {
                logger.error(`❌ Job execution failed for job ${jobId}:`, err);
            }
            
            //get the status of the job
            jobMeta.status = success ? 'completed' : 'failed';
            
            //if the job has successfully completed, we're happy and we perform happy updates
            if(jobMeta.status === 'completed'){
                jobMeta.completedAt = Date.now().toString();
            //     await redis.hset(jobMetaKey(jobId), {
            //     ...jobMeta,
            //     success: String(success),
            //     output: output || '',
            //     error: error || '',
            // });
            } else {
                //this is where the job fked up
                //set a retry count since the job obviously failed the first time,  so we give it a second chance(3 chances actually)
                jobMeta.retries = (parseInt(jobMeta.retries || '0') + 1).toString();
                //since we give it retries, we need to check if the max retries has been reached
                if (parseInt(jobMeta.retries) > MAX_RETRIES){
                    logger.info(`❌ Job failed after ${MAX_RETRIES} retries: ${jobId}`);
                    jobMeta.status = 'failed';
                    jobMeta.completedAt = Date.now().toString();
                    //ooh groovy stuff, we push jobs that have failed max retries times to the dead letter queue
                    await redis.lpush(DEAD_LETTER_QUEUE, jobId); 
                } else {
                    //in the event where the retries have not exceeded max retries, we push it into the queue again for execution
                    jobMeta.status = 'pending';
                    const backoff = BASE_BACKOFF_MS * Math.pow(2, parseInt(jobMeta.retries || '0'));
                    jobMeta.nextRetryAt = (Date.now() + backoff).toString();
                    logger.info(`⏰ Job: ${jobId} has failed. Retrying in ${backoff}ms `);
                    //but this time we push it back into the queue with a backoff so that it waits a period of time before being retried
                    setTimeout(() => {
                        redis.lpush(JOB_QUEUE, jobId);
                    }, backoff);
                }
            }

            //finally we update the job metadata
            await redis.hset(jobMetaKey(jobId), {
                ...jobMeta,
                success: String(success),
                output: output || '',
                error: error || '',
            })  

            logger.info(`✅ Job ${success ? 'completed' : 'failed'}: ${jobId}`);
            logger.debug({ success, output, error });

        } catch (err: any) {
            logger.error(`❌ Job processing failed: ${err.message}`);
        }
    } 

    //this will start the worker duh!
    async startWorker() {
        logger.info("🚀 Worker started and waiting for jobs...");
        while(true){ await this.processJob(); }
    }
}
