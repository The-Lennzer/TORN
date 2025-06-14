import { payloadInterface } from "../types/job.types";

export interface Executor {
    execute: (job: any) => Promise<{ success: boolean; output?: string; error?: string }>;
}