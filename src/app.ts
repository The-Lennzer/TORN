/*
    NOTE: I PUT THOSE EMOJIS IN THE LOGGERS BECAUSE I LIKE THEM AND THEY MAKE THE LOGS LOOK COOL
    UPDATE: emoji's don't work in the logger so I removed them 😐
*/

import { buildServer } from "./server";
import dotenv from "dotenv";
import Worker from "./workers/job.worker";
import startRetryProcessor from "./retry/retry.processor";

dotenv.config();

const startServer = async() => {
    const server = await buildServer();
    try{
        await server.listen({port: Number(process.env.PORT) || 8000});
        console.log("🎃 Job Orchestration Engine is Online at PORT: http://localhost:", process.env.PORT)

        const worker = new Worker();
        await worker.startWorker();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

startRetryProcessor();
startServer();
