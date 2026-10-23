import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {Redis} from 'ioredis';
import { CacheService } from '../../core/cache/cache.service.js';
import { RedisCacheService } from './redis-cache.service.js';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get<string>('REDIS_HOST') ?? '127.0.0.1',
          port: configService.get<number>('REDIS_PORT') ?? 6379,
        });
      },
    },
    RedisCacheService,
    {
      provide: CacheService,
      useExisting: RedisCacheService,
    },
  ],
  exports: [CacheService],
})
export class RedisCacheModule {}
