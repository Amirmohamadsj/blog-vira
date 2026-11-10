import { CanActivate,ExecutionContext,Inject,Injectable,UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { TokenService } from "../auth/token-service.js";
import { AuthTokenPayload } from "../types/auth-token-payload.type.js";
import { createHash } from "node:crypto";
import { CacheService } from "../cache/cache.service.js";

type AuthenticatedRequest = Request & {
  user: AuthTokenPayload;
};

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject(TokenService)
  private readonly tokenService!: TokenService;

  @Inject(CacheService)
  private readonly casheService! : CacheService;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    const token = authorization.slice(7);

    let payload: AuthTokenPayload;

    try {
      payload = await this.tokenService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    const isBlacklisted = await this.casheService.get(
      `auth:blacklist:${tokenHash}`,
    );

    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    request.user = payload;
    return true;
  }
}