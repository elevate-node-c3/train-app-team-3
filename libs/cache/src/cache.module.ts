import { DynamicModule, Global, Module } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { CacheService } from './cache.service';

@Global()
@Module({})
export class CacheModule {
    static register(options: RedisOptions): DynamicModule {
        const redisProvider = {
            provide: 'REDIS_CLIENT',
            useFactory: () => new Redis(options),
        };

        return {
            module: CacheModule,
            providers: [redisProvider, CacheService],
            exports: [redisProvider, CacheService],
        };
    }
}