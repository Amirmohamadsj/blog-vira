import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsersModule } from '../users/users.module.js';
import { JwtModuleInfra } from '../../infra/jwt/jwt.module.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { RedisCacheModule } from '../../infra/cache/redis-cache.module.js';

@Module({
  imports:[JwtModuleInfra,UsersModule,RedisCacheModule],
  controllers: [AuthController],
  providers: [AuthService,AuthGuard,RolesGuard],
  exports : [AuthService,AuthGuard,RolesGuard]
})
export class AuthModule {}
