import { Executor } from "./executor.interface";
import logger from "../utils/logger";

class DefaultExecutor implements Executor {
    async execute(job: any): Promise<{ success: boolean; output?: string; error?: string }> {
        logger.error(`Unknown job type: ${job?.type}`);
        return { success: false, error: `Unknown job type: ${job?.type}` };
    }
}

export default DefaultExecutor;