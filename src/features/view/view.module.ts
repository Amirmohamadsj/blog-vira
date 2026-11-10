import { Module } from '@nestjs/common';
import { ViewService } from './view.service.js';
import { ViewController } from './view.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { View } from '../../core/entities/view.entity.js';
import { Post } from '../../core/entities/post.entity.js';
import { RedisCacheModule } from '../../infra/cache/redis-cache.module.js';
import { JwtModuleInfra } from '../../infra/jwt/jwt.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { OptionalAuthGuard } from '../../core/guards/optional-auth.guard.js';

@Module({
  imports:[TypeOrmModule.forFeature([View,Post]),RedisCacheModule,JwtModuleInfra,AuthModule],
  providers: [ViewService,OptionalAuthGuard],
  controllers: [ViewController]
})
export class ViewModule {}
