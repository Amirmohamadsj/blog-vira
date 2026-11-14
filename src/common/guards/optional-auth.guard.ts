import { CanActivate,ExecutionContext,Inject,Injectable,UnauthorizedException } from "@nestjs/common";

import type { Request } from 'express';
import { createHash } from 'node:crypto';

import { TokenService } from '../../core/auth/token-service.js';
import type { AuthTokenPayload } from "../../core/types/auth-token-payload.type.js";
import { CacheService } from '../../core/cache/cache.service.js';


type OptionalAuthRequest = Request & {
    user?: AuthTokenPayload;
    accessToken?: string;
};

@Injectable()
export class OptionalAuthGuard implements CanActivate {

    @Inject(TokenService)
    private readonly tokenService!: TokenService;

    @Inject(CacheService)
    private readonly cacheService!: CacheService;

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const request = context.switchToHttp().getRequest<OptionalAuthRequest>();

        const authorization = request.headers.authorization;

        if (!authorization) {
            return true;
        }

        if (!authorization.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid token');
        }

        const token = authorization.slice(7);

        let payload: AuthTokenPayload ; 

        try {
            payload = await this.tokenService.verify(token);
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }

        const tokenHash = createHash('sha256')
          .update(token)
          .digest('hex');

        const isBlacklisted = await this.cacheService.get(
            `auth:blacklist:${tokenHash}`,
        );


        if (isBlacklisted) {
            throw new UnauthorizedException('Token has been revoked');
        }

        request.user = payload,
        request.accessToken = token;

        return true;
    }
}



