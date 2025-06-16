import { FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import redis from '../queue/redis';
import { CommandJobInterface } from '../types/job.types';

async function enqueueJobHandler(req: FastifyRequest, res: FastifyReply) {
    const {type, command, args, timeout} = req.body as CommandJobInterface;

    if (!type || !command) {
        res.status(400).send({ error: 'Invalid job format' });
        return;
    }

    const jobId = uuidv4();
    const createdAt = Date.now();

    //add metadata to Hash
    redis.hset(`job:${jobId}`, {
        status: 'pending',
        retries: 0,
        createdAt: Date.now().toString(),
        startedAt: null,
        completedAt: null,
        nextRetryAt: null
    })
    
    //add the payload data
    redis.hset(`job:${jobId}:data`, {
        type, 
        command,
        args: JSON.stringify(args),
        timeout
    });

    //push to job queue
    redis.lpush('job:default', jobId);

    return res.send({ jobId });
}

export {
    enqueueJobHandler
}