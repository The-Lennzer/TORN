import { spawn } from "child_process";
import logger from "../utils/logger";
import { CommandJobInterface } from "../types/job.types";
import { clear } from "console";

class CommandExecutor {
    async execute(job: CommandJobInterface): Promise<{ success: boolean; output?: string; error?: string }>{
        return new Promise((resolve) => {
            try{
            //extract job fields
            const {type, command, args, timeout} = job;

            //checking if the type matches and command is set
            if (type != 'command' || !command) {
                logger.error(`Bad Job Type: ${type} or Missing command: ${command}`);
                return resolve({ 
                    success: false, 
                    error: 'No command provided' 
                });
            }
            
            const timeoutMs = Number(timeout) || 10000;
            logger.info(`Executing command: ${job.command} ${args.join(" ")}`);

            //spawn create a child process - I think like a fork(): here used to run a shell commmand
            const child = spawn(command, args, { 
                timeout: timeoutMs,
                shell: true
             });

            let stdout = '';
            let stderr = '';

            //after timeoutMs, the child process gets killed and error is thrown
            const commandTimeout = setTimeout(() => {
                logger.error(`Job timed out after ${timeoutMs}ms`);
                child.kill("SIGTERM");
                resolve({ success: false, error: "Execution timed out" });
            }, timeoutMs);

            //listening to the child output
            child.stdout.on('data', (data) => {
                stdout += data;
            });

            //listening to the child errors
            child.stderr.on('data', (data) => {
                stderr += data;
            });

            if (stderr) logger.error(`Stderr: ${stderr}`);

            //handling child process finish
            child.on('close', (code) => {
                clearTimeout(commandTimeout);

                if(code === 0){
                    logger.info(`Command executed successfully`);
                    resolve({ success: true, output: stdout });
                } else {
                    logger.error(`Command execution failed with code: ${code}`);
                    resolve({ success: false, error: stderr.trim() || 'Unknown error!' });
                }
            })

            //handling error starting child process
            child.on('error', (err) => {
                logger.error(`Failed to start command: ${err.message}`);
                if (stderr) logger.error(`Stderr: ${stderr}`);
                resolve({ success: false, error: err.message });
            })
        }catch (err: any) {
            logger.error(`Unexpected error in Command Executor: ${err.message}`);
            resolve({ success: false, error: err.message });
        }

        })
    }
}

export default CommandExecutor;