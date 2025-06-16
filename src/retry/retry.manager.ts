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
        return await redis.zrangebyscore(RETRY_QUEUE, 0, now);
    }

    async removeRetries(jobId: string): Promise<void>{
        await redis.zrem(RETRY_QUEUE, jobId);
    }

    async requeueRetries(jobId: string): Promise<void> {
        await redis.lpush(JOB_QUEUE, jobId);
    }

    async markNextRetry(delayMs: number, jobId: string): Promise<number>{
        const nextRetryAt = Date.now() + delayMs;
        await this.scheduler(jobId, nextRetryAt);
        return nextRetryAt;
    }
}

export default RetryManager;