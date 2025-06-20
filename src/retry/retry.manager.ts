import redis from "../queue/redis";
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
    async scheduler(jobId: string, retryAt: number): Promise<void>{
        await redis.zadd(RETRY_QUEUE, retryAt, jobId);
    }

    async getDueRetries(now: number): Promise<string[]>{
        const jobs = await redis.zrangebyscore(RETRY_QUEUE, 0, now);
        return jobs;
    }

    async removeRetries(jobId: string): Promise<void>{
        await redis.zrem(RETRY_QUEUE, jobId);
    }

    async requeueRetries(jobId: string): Promise<void> {
        const multi = redis.multi();
        await redis.zrem(RETRY_QUEUE, jobId);
        await redis.lpush(JOB_QUEUE, jobId);
        await multi.exec();
    }

    async markNextRetry(jobId: string, delayMs: number): Promise<number>{
        const nextRetryAt = Date.now() + delayMs;
        await this.scheduler(jobId, nextRetryAt);
        return nextRetryAt;
    }
}

export default RetryManager;