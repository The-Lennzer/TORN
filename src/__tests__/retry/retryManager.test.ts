import RetryManager from "../../retry/retry.manager";
import {redis as mockRedis} from "../../queue/__mock__/redis";

// const retryManager = new RetryManager(mockRedis);

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

});