import Fastify from 'fastify';
import jobRoutes from './routes/job.routes';

export const buildServer = async () => {
    const server = Fastify();
    server.register(jobRoutes, { prefix: '/api/jobs' });
    return server;
};
