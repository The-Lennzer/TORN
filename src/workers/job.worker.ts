import redis from "../queue/redis";
import logger from "../utils/logger";
import ExecutorFactory from "../executors/executor.factory";
import {
    JOB_QUEUE,
    jobMetaKey,
    jobDataKey
} from "../lib/constants";

class Worker{
    async processJob(): Promise<void> {
        try{
            const jobIdRequest = await redis.brpop('job:default', 5);

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

                logger.info(`✅ Job completed: ${jobId}`);
                logger.info({
                    success,
                    output,
                    error
                })
            } catch (err) {
                logger.error(`❌ Job execution failed for job ${jobId}:`, err);
                jobMeta.retries = (parseInt(jobMeta.retries || '0') + 1).toString();
            }

            jobMeta.status = success ? 'completed' : 'failed';
            if(jobMeta.status === 'completed'){
                jobMeta.completedAt = Date.now().toString();
            }
            else{
                jobMeta.retries = (parseInt(jobMeta.retries || '0') + 1).toString();
            }

            await redis.hset(jobMetaKey(jobId), {
                ...jobMeta,
                success: String(success),
                output: output || '',
                error: error || '',
            });

            logger.info(`✅ Job ${success ? 'completed' : 'failed'}: ${jobId}`);
            logger.debug({ success, output, error });

        } catch (err: any) {
            logger.error(`❌ Job processing failed: ${err.message}`);
        }

        //hehe recursive function call to keep processing jobs based on brpop blocking call
        this.processJob();
    } 

    //this will start the worker duh!
    startWorker() {
        logger.info("🚀 Worker started and waiting for jobs...");
        this.processJob();
    }
}
