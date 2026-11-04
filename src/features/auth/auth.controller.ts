import { Controller,Body,HttpCode,HttpStatus,Inject,Post, UseGuards,Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginAuthModels } from '../../core/models/auth-models/login-auth.models.js';
import { CreateUserModels } from '../../core/models/user-models/create-user.models.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import type { Request } from 'express';
import { AuthTokenPayload } from '../../core/types/auth-token-payload.type.js';
import { ChangePasswordModels } from '../../core/models/auth-models/change-password.models.js';



type AuthenticatedRequest = Request & {
  user: AuthTokenPayload;
};


@Controller('auth')
export class AuthController {

    @Inject(AuthService)
    private readonly authService! : AuthService;

    
    @Post('register')
    register(@Body() createUserModels : CreateUserModels){
        return this.authService.register(createUserModels)
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() loginAuthModels : LoginAuthModels){
        return this.authService.login(loginAuthModels);
    }

    @UseGuards(AuthGuard)
    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    async changePassword(
            @Body() body: ChangePasswordModels,
            @Req() request: AuthenticatedRequest,
        ) {
        return this.authService.changePassword(
            Number(request.user.sub),
            body,
        );
    }


    @UseGuards(AuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Req() request : AuthenticatedRequest,
    ):Promise<{ message : string}>{
     const authorization = request.headers.authorization;        
     const token = authorization!.slice(7);

        return this.authService.logout(token,request.user)
    }


}
