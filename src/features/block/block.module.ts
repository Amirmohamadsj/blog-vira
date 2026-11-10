import { Module } from '@nestjs/common';
import { BlockService } from './block.service.js';
import { BlockController, PostBlocksController } from './block.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from '../../core/entities/block.entity.js';
import { JwtModuleInfra } from '../../infra/jwt/jwt.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { RedisCacheModule } from '../../infra/cache/redis-cache.module.js';
import { Post } from '../../core/entities/post.entity.js';
import { Media } from '../../core/entities/media.entity.js';

@Module({
  imports : [TypeOrmModule.forFeature([Block,Post,Media]),JwtModuleInfra,AuthModule,RedisCacheModule],
  providers: [BlockService,AuthModule],
  controllers: [BlockController,PostBlocksController]
})
export class BlockModule {}
