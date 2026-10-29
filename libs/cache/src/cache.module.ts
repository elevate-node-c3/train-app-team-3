import { DynamicModule, Global, Module, ModuleMetadata } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { CacheService } from './cache.service';

export interface CacheModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    useFactory: (...args: any[]) => Promise<RedisOptions> | RedisOptions;
    inject?: any[];
}

@Global()
@Module({})
export class CacheModule {
    static register(options: RedisOptions): DynamicModule {
        const redisProvider = {
            provide: 'REDIS_CLIENT',
            useFactory: () => new Redis({
                ...options,
                lazyConnect: true,
                maxRetriesPerRequest: 1,
                retryStrategy: (times) => Math.min(times * 100, 3000),
            }),
        };

        return {
            module: CacheModule,
            providers: [redisProvider, CacheService],
            exports: [redisProvider, CacheService],
        };
    }

    static registerAsync(options: CacheModuleAsyncOptions): DynamicModule {
        const redisProvider = {
            provide: 'REDIS_CLIENT',
            useFactory: async (...args: any[]) => {
                const config = await options.useFactory(...args);
                return new Redis({
                    ...config,
                    lazyConnect: true,
                    maxRetriesPerRequest: 1,
                    retryStrategy: (times) => Math.min(times * 100, 3000),
                });
            },
            inject: options.inject || [],
        };

        return {
            module: CacheModule,
            imports: options.imports || [],
            providers: [redisProvider, CacheService],
            exports: [redisProvider, CacheService],
        };
    }
}