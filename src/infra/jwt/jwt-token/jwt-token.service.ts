import { Injectable,Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../../../core/auth/token-service.js';
import { AuthTokenPayload } from '../../../core/types/auth-token-payload.type.js';


@Injectable()
export class JwtTokenService extends TokenService {
  @Inject(JwtService)
  private readonly jwtService!: JwtService;

  sign(payload: AuthTokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  verify(token: string): Promise<AuthTokenPayload> {
    return this.jwtService.verifyAsync<AuthTokenPayload>(token);
  }
}
