/*
    NOTE: I PUT THOSE EMOJIS IN THE LOGGERS BECAUSE I LIKE THEM AND THEY MAKE THE LOGS LOOK COOL
*/

import { buildServer } from "./server";
import dotenv from "dotenv";

dotenv.config();

const startServer = async() => {
    const server = await buildServer();
    try{
        await server.listen({port: Number(process.env.PORT) || 8000});
        console.log("🎃 Job Orchestration Engine is Online at PORT: http://localhost:", process.env.PORT)
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

startServer();