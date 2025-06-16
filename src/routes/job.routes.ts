import {FastifyInstance, FastifyPluginOptions} from "fastify";
import { enqueueJobHandler } from "../controllers/job.controller";
async function jobRoutes(
    server: FastifyInstance,
    _options: FastifyPluginOptions
){
    server.get('/health', async (request, reply) => {
        return { status: 'ok' };
    });

    server.post('/enqueue', enqueueJobHandler);
}


export default jobRoutes;