import { Injectable, Inject, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class CacheService implements OnModuleDestroy {
  constructor(@Inject("REDIS_CLIENT") private readonly redis: Redis) {}

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<"OK"> {
    if (ttlSeconds) {
      return this.redis.set(key, value, "EX", ttlSeconds);
    }
    return this.redis.set(key, value);
  }

  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }
  async getTTL(key: string): Promise<number> {
    const expiresAt = await this.redis.ttl(key);
    if (!expiresAt) return 0;
    return Math.max(0, expiresAt - Date.now());
  }
  onModuleDestroy() {
    this.redis.disconnect();
  }
}
