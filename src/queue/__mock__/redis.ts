const zset: Map<string, number> = new Map();
const queue: string[] = [];

const redis = {
  zadd: async (_key: string, score: number, member: string) => {
    zset.set(member, score);
  },

  zrangebyscore: async (_key: string, min: number, max: number): Promise<string[]> => {
    const now = Date.now();
    return Array.from(zset.entries())
      .filter(([_, score]) => score >= min && score <= max)
      .map(([member]) => member);
  },

  zrem: async (_key: string, member: string) => {
    zset.delete(member);
  },

  lpush: async (_key: string, member: string) => {
    queue.unshift(member);
  },

  // optional: useful for assertions
  __getZSet: () => zset,
  __getQueue: () => queue,
};

export {
    redis
}