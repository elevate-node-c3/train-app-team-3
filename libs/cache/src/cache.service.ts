import { Injectable, Inject, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

export type CacheValue = string | number | boolean | Record<string, unknown> | unknown[] | null;

@Injectable()
export class CacheService implements OnModuleDestroy {
  constructor(@Inject("REDIS_CLIENT") private readonly redis: Redis) {}

  async get<T = string | null>(key: string): Promise<T | null> {
    const rawValue = await this.redis.get(key);
    if (rawValue === null) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return rawValue as T;
    }
  }

  async set(key: string, value: CacheValue, ttlSeconds?: number): Promise<"OK"> {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value ?? "");

    if (typeof ttlSeconds === "number" && ttlSeconds >= 0) {
      return this.redis.set(key, stringValue, "EX", Math.max(1, Math.ceil(ttlSeconds)));
    }

    return this.redis.set(key, stringValue);
  }

  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }

  async getTTL(key: string): Promise<number> {
    const ttlSeconds = await this.redis.ttl(key);
    if (ttlSeconds <= 0) {
      return 0;
    }
    return ttlSeconds * 1000;
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}
