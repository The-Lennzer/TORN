import Redis from "ioredis";

let redisClient: Redis;

export function getRedisClient(): Redis {
    if(!redisClient){
        redisClient = new Redis();
    }
    return redisClient;
}

export function setRedisClient(client: Redis) {
    redisClient = client;
}
