const JOB_QUEUE = 'job:default';
const jobMetaKey = (id: string) => `job:${id}`;
const jobDataKey = (id: string) => `job:${id}:data`;

export {
    JOB_QUEUE,
    jobMetaKey,
    jobDataKey
}