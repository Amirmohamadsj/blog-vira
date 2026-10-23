import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import {Redis} from 'ioredis';
import { CacheService } from '../../core/cache/cache.service.js';

@Injectable()
export class RedisCacheService
  extends CacheService
  implements OnModuleDestroy
{
  @Inject('REDIS_CLIENT')
  private readonly redis!: Redis;

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<void> {
    await this.redis.set(key, value, 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
