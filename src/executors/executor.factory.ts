import { Executor } from "./executor.interface";
import  CommandExecutor from "./command.executor";
import DefaultExecutor from "./default.executor";
import logger from "../utils/logger";
class ExecutorFactory {
        static create(strategy: string): Executor {
            switch (strategy) {
                case 'command':
                    return new CommandExecutor();
                default:
                    logger.error(`Unknown executor strategy: ${strategy}`);
                    return new DefaultExecutor();
            }
        }
}

export default ExecutorFactory;