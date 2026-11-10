import { Module } from '@nestjs/common';
import { TagService } from './tag.service.js';
import { TagController } from './tag.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from '../../core/entities/tag.entity.js';
import { JwtModuleInfra } from '../../infra/jwt/jwt.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { RedisCacheModule } from '../../infra/cache/redis-cache.module.js';

@Module({
  imports:[TypeOrmModule.forFeature([Tag]),JwtModuleInfra,AuthModule,RedisCacheModule],
  providers: [TagService,AuthModule],
  controllers: [TagController],
  exports : [TagService]
})
export class TagModule {}
