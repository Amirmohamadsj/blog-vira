import { Injectable,Inject,UnauthorizedException,BadRequestException } from '@nestjs/common';
import bcrypt from "bcrypt"
import { UsersService } from '../users/users.service.js';
import { TokenService } from '../../core/auth/token-service.js';
import { LoginAuthModels } from '../../core/models/auth-models/login-auth.models.js';
import { CreateUserModels } from '../../core/models/user-models/create-user.models.js';
import { AuthTokenPayload } from '../../core/types/auth-token-payload.type.js';
import { createHash } from 'node:crypto';
import { CacheService } from '../../core/cache/cache.service.js';
import { ChangePasswordModels } from '../../core/models/auth-models/change-password.models.js';


@Injectable()
export class AuthService {

    @Inject(UsersService)
    private readonly usersService! : UsersService;

    @Inject(TokenService)
    private readonly tokenService! : TokenService;

    @Inject(CacheService)
    private readonly cacheService!: CacheService;

    async register(createUserModels : CreateUserModels){
        const user = await this.usersService.createUser(createUserModels)

        return user
    }


    async login(loginAuthModels : LoginAuthModels){
        const user = await this.usersService.getUserForAuth(
            loginAuthModels.email,
        );

        if( (!user) || !(await bcrypt.compare(loginAuthModels.password,user.password))
        ){
          throw new  UnauthorizedException('Invalid email or password')
         }

         const payload: AuthTokenPayload = {
            sub: user.id,
            role: user.role,
            };

        const accessToken = await this.tokenService.sign(payload);

         return {
            accessToken,
            user:{
                id : user.id,
                username : user.username,
                email : user.email,
                role : user.role,
            },
         };
    }


    async changePassword(
        userId: number,
        changePasswordModels: ChangePasswordModels,
    ) {
        const user = await this.usersService.getUserForPasswordChange(userId);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(
            changePasswordModels.currentPassword,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        if (
            changePasswordModels.currentPassword ===
            changePasswordModels.newPassword
        ) {
            throw new BadRequestException(
            'New password must be different from current password',
            );
        }

        const hashedPassword = await bcrypt.hash(
            changePasswordModels.newPassword,
            10,
        );

        await this.usersService.updatePassword(userId, hashedPassword);

        return {
            message: 'Password changed successfully',
        };
    }



    async logout(
        token : string,
        payload : AuthTokenPayload,
    ):Promise<{ message : string}>{
        const now = Math.floor(Date.now() / 1000);

        if(!payload.exp || payload.exp <= now){
                throw new UnauthorizedException('Token has expired or is invalid');
        }

        const tokenHash = createHash('sha256')
            .update(token)
            .digest('hex');
        const ttlSeconds = payload.exp - now;

        await this.cacheService.set(
            `auth:blacklist:${tokenHash}`,
            '1',
            ttlSeconds,
        );

        return { message : 'Logged out successfully'}
    }
}
