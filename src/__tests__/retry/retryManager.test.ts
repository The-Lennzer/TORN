import RedisMock from 'ioredis-mock';
import RetryManager from "../../retry/retry.manager";
import { setRedisClient, getRedisClient } from '../../queue/redis';
import {
    JOB_QUEUE,
} from '../../lib/constants';
import { get } from 'http';

// const retryManager = new RetryManager(mockRedis);
const mockRedis = new RedisMock();
setRedisClient(mockRedis);

describe('retry manager', () => {
    let retryManager: RetryManager;

    beforeEach(() => {

        retryManager = new RetryManager(mockRedis);
    });

    it('schedule a retry and retrieve it', async () => {
        const jobId = 'job-test-123';
        const retryAt = Date.now() + 1000;

        await retryManager.scheduler(jobId, retryAt);

        const dueJobsNow = await retryManager.getDueRetries(Date.now());
        expect(dueJobsNow).not.toContain(jobId);

        const dueJobsLater = await retryManager.getDueRetries(Date.now() + 1500);
        expect(dueJobsLater).toContain(jobId);
    });

    it('removes retry job from zset', async () => {
        const jobId = 'job-test-456';
        await retryManager.scheduler(jobId, Date.now() + 1000);

        await retryManager.removeRetries(jobId);
        
        const dueJobsNow = await retryManager.getDueRetries(Date.now());
        expect(dueJobsNow).not.toContain(jobId);
    });

    it('pushes job back to main queue', async () => {
        const jobId = 'job-789';
        await retryManager.requeueRetries(jobId);

        const queue = await mockRedis.lrange(JOB_QUEUE, 0, -1);
        expect(queue).toContain(jobId);
    });

    it('schedules next retry with delay', async () => {
        const jobId = 'job-101';
        const delay = 5000;
        const now = Date.now();

        const futureTime = await retryManager.markNextRetry(jobId, delay);
        
        // Confirm it's actually in the sorted set at approximately the right score
        const zsetJobs = await mockRedis.zrangebyscore('retry_queue', now + delay - 100, now + delay + 100);
        expect(zsetJobs).toContain(jobId);
    });

});