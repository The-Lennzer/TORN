// import { getRedisClient} from "../queue/redis";
import Redis from "ioredis";
import { 
    RETRY_QUEUE,
    JOB_QUEUE
 } from "../lib/constants";
// scheduler
// getter
// remover
// requeue
// setter
class RetryManager {
    constructor(private redisClient: Redis){}
    async scheduler(jobId: string, retryAt: number): Promise<void>{
        await this.redisClient.zadd(RETRY_QUEUE, retryAt, jobId);
    }

    async getDueRetries(now: number): Promise<string[]>{
        const jobs = await this.redisClient.zrangebyscore(RETRY_QUEUE, 0, now);
        return jobs;
    }

    async removeRetries(jobId: string): Promise<void>{
        await this.redisClient.zrem(RETRY_QUEUE, jobId);
    }

    async requeueRetries(jobId: string): Promise<void> {
        const multi = this.redisClient.multi();
        await this.redisClient.zrem(RETRY_QUEUE, jobId);
        await this.redisClient.lpush(JOB_QUEUE, jobId);
        await multi.exec();
    }

    async markNextRetry(jobId: string, delayMs: number): Promise<number>{
        const nextRetryAt = Date.now() + delayMs;
        await this.scheduler(jobId, nextRetryAt);
        return nextRetryAt;
    }
}

export default RetryManager;