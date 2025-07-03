import { getRedisClient } from "../queue/redis";
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
 import RetryManager from "../retry/retry.manager";
import { get } from "http";

class Worker{
    async processJob(): Promise<void> {
        const redis = getRedisClient();
        try{
            const jobIdRequest = await redis.brpop(JOB_QUEUE, 5);

            if (!jobIdRequest) {
                logger.info('Queue might be empty, Looking for jobs!');
                return;
            }

            const jobId = jobIdRequest[1];    
            console.log("THE JOBID YOU're PROCESSING:", jobId)                          //identifies the job
            const jobMeta = await redis.hgetall(jobMetaKey(jobId));     //gets the job metadata(status, timestamps etc)
            const job = await redis.hgetall(jobDataKey(jobId));         //the payload


            if (job.args) {
                job.args = JSON.parse(job.args);  
            }


            jobMeta.status = 'processing';
            jobMeta.startedAt = Date.now().toString();
            await redis.hset(jobMetaKey(jobId), jobMeta);

            logger.info(`Processing job: ${jobId}`);

            let success = false;              //  |  
            let output: string | undefined;   //  | Structured logging variables
            let error: string | undefined;    //  |

            logger.info({
                jobId: jobId,
                jobMeta: jobMeta,
                job: job
            });
            

            try {
                const Executioner = ExecutorFactory.create(job.type); //Factory patten returns the executor based on job.type

                const jobResults = await Executioner.execute(job);
                success = jobResults.success;
                output = jobResults.output;
                error = jobResults.error;

                logger.info(`Job execution completed SUCCESSFULLY for job: ${jobId}`); 
            } catch (err: any) {
                logger.error(`Job execution FAILED for job ${jobId}:`, err);
                console.log("Error:", err);
            }

             logger.info({
                    success,
                    output,
                    error
                })
            
            jobMeta.status = success ? 'completed' : 'failed';
            
            if(jobMeta.status === 'completed'){
                jobMeta.completedAt = Date.now().toString();
            } else {
                const retry = parseInt(jobMeta.retries || '0') + 1
                jobMeta.retries = retry.toString();
                const retryManager = new RetryManager(redis);

                if (retry > MAX_RETRIES){
                    logger.info(`Job failed after ${retry} retries: ${jobId}`); //job has finished all retries and is moved to DLQ
                    jobMeta.status = 'failed';
                    jobMeta.completedAt = Date.now().toString();
                    retryManager.removeRetries(jobId);
                    await redis.lpush(DEAD_LETTER_QUEUE, jobId); 
                } else {
                
                    jobMeta.status = 'pending';
                    const backoff = BASE_BACKOFF_MS * Math.pow(2, retry);
                    const nextRetryAt = await retryManager.markNextRetry(jobId, backoff);

                    jobMeta.nextRetryAt = nextRetryAt.toString();
                    logger.info(`Job: ${jobId} has failed. Retrying in ${backoff}ms `);
                }
            }

            await redis.hset(jobMetaKey(jobId), {
                ...jobMeta,
                success: String(success),
                output: output || '',
                error: error || '',
            })  

            logger.info(`Job ${success ? 'completed' : 'failed'}: ${jobId}`);
            logger.debug({ success, output, error });

        } catch (err: any) {
            logger.error(`Job processing failed: ${err.message}`);
        }
    } 

    //this will start the worker duh!
    async startWorker() {
        logger.info("Worker started and waiting for jobs...");
        while(true){ await this.processJob(); }
    }
}

export default Worker;
