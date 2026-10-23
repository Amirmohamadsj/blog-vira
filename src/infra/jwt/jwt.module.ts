import { Module } from '@nestjs/common';
import { JwtTokenService } from './jwt-token/jwt-token.service.js';
import { ConfigService } from '@nestjs/config';
import { JwtModule,JwtModuleOptions } from '@nestjs/jwt';
import { TokenService } from '../../core/auth/token-service.js';


@Module({
  imports : [
    JwtModule.registerAsync({
      inject : [ConfigService],
      useFactory : (configService : ConfigService) : JwtModuleOptions => ({
        secret : configService.getOrThrow<string>('JWT_SECRET'),
        signOptions :{
          expiresIn : (
            configService.get<string>('JWT_EXPIRES_IN') ?? '15m'
          ) as NonNullable<JwtModuleOptions['signOptions']>['expiresIn'],
        }
      })
    })
  ],
  providers: [JwtTokenService,{
    provide:TokenService,
    useExisting : JwtTokenService,
  },
  ],
  exports : [TokenService]
})
export class JwtModuleInfra {}
