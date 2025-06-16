const JOB_QUEUE = 'job:default';
const DEAD_LETTER_QUEUE = 'job:dead';
const RETRY_QUEUE = "retry_queue";

const jobMetaKey = (id: string) => `job:${id}`;
const jobDataKey = (id: string) => `job:${id}:data`;

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000; 

export {
    JOB_QUEUE,
    jobMetaKey,
    jobDataKey,
    MAX_RETRIES,
    BASE_BACKOFF_MS,
    DEAD_LETTER_QUEUE,
    RETRY_QUEUE
}