import RetryManager from "./retry.manager";
import logger from "../utils/logger";
import { start } from "repl";

const retryManager = new RetryManager();

const startRetryProcessor = async (retryIntervalMs:number = 5000) => {
    logger.info("Retries have begun!");

    setInterval(async () => {
        const now = Date.now();
        const dueJobIds = await retryManager.getDueRetries(Date.now());

        for(const jobId  in dueJobIds){
            logger.info(`job: ${jobId} is scheduled for retry!`);
            await retryManager.requeueRetries(jobId);
            await retryManager.removeRetries(jobId);
        }

    }, retryIntervalMs);
}

export default startRetryProcessor;