import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../core/entities/user.entity.js';
import { JwtModuleInfra } from '../../infra/jwt/jwt.module.js';
import { RedisCacheModule } from '../../infra/cache/redis-cache.module.js';

@Module({
  imports : [TypeOrmModule.forFeature([User]),
  JwtModuleInfra,RedisCacheModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports : [UsersService]
})
export class UsersModule {}
