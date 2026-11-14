import { Module } from '@nestjs/common';
import { CategoriesService } from './category.service.js';
import { CategoriesController } from './category.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../core/entities/category.entity.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { JwtModuleInfra } from '../../infra/jwt/jwt.module.js';
import { RedisCacheModule } from '../../infra/cache/redis-cache.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports:[TypeOrmModule.forFeature([Category]),
  JwtModuleInfra,AuthModule,RedisCacheModule],
  providers: [CategoriesService,AuthGuard],
  controllers: [CategoriesController],
  exports : [CategoriesService]
})
export class CategoryModule {}
