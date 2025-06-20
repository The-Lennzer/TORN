import RetryManager from "./retry.manager";
import logger from "../utils/logger";
import redis from "../queue/redis";

const retryManager = new RetryManager();

const startRetryProcessor = async (retryIntervalMs:number = 5000) => {
    logger.info("Retries have begun!");

    setInterval(async () => {
        const now = Date.now();
        const dueJobIds = await retryManager.getDueRetries(Date.now());
        if(dueJobIds){
            logger.info(`There are ${dueJobIds.length} jobs due for retry!`);
        }
        for(const jobId of dueJobIds){
            logger.info(`job: ${jobId} is scheduled for retry!`);
            try {
                logger.info(`🔁 Retrying job: ${jobId}`);
                await retryManager.requeueRetries(jobId);
            } catch (err) {
                logger.error(`❌ Failed to retry job ${jobId}: ${(err as Error).message}`);
            }
        }

    }, retryIntervalMs);
}

export default startRetryProcessor;