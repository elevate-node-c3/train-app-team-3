import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
    private readonly logger = new Logger(CacheService.name);

    constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) { }

    async get(key: string): Promise<string | null> {
        try {
            return await this.redis.get(key);
        } catch (err: any) {
            this.logger.warn(`Redis GET failed for key [${key}]: ${err.message}`);
            return null;
        }
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<'OK' | null> {
        try {
            if (ttlSeconds) {
                return await this.redis.set(key, value, 'EX', ttlSeconds);
            }
            return await this.redis.set(key, value);
        } catch (err: any) {
            this.logger.warn(`Redis SET failed for key [${key}]: ${err.message}`);
            return null;
        }
    }

    async del(key: string): Promise<number> {
        try {
            return await this.redis.del(key);
        } catch (err: any) {
            this.logger.warn(`Redis DEL failed for key [${key}]: ${err.message}`);
            return 0;
        }
    }

    async incr(key: string): Promise<number | null> {
        try {
            return await this.redis.incr(key);
        } catch (err: any) {
            this.logger.warn(`Redis INCR failed for key [${key}]: ${err.message}`);
            return null;
        }
    }

    async expire(key: string, seconds: number): Promise<number> {
        try {
            return await this.redis.expire(key, seconds);
        } catch (err: any) {
            this.logger.warn(`Redis EXPIRE failed for key [${key}]: ${err.message}`);
            return 0;
        }
    }

    async ttl(key: string): Promise<number> {
        try {
            return await this.redis.ttl(key);
        } catch (err: any) {
            this.logger.warn(`Redis TTL failed for key [${key}]: ${err.message}`);
            return -2;
        }
    }

    onModuleDestroy() {
        try {
            this.redis.disconnect();
        } catch {
            // ignore on shutdown
        }
    }
}