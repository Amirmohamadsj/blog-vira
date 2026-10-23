import { Module } from '@nestjs/common';
import { MediaService } from './media.service.js';
import { MediaController } from './media.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from '../../core/entities/media.entity.js';
import { StorageModule } from '../../infra/storage/storage.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { JwtModuleInfra } from '../../infra/jwt/jwt.module.js';
import { RedisCacheModule } from '../../infra/cache/redis-cache.module.js';

@Module({
  imports : [TypeOrmModule.forFeature([Media]),StorageModule,AuthModule,JwtModuleInfra,RedisCacheModule],
  providers: [MediaService],
  controllers: [MediaController]
})
export class MediaModule {}
