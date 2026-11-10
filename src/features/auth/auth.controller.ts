import { Controller,Body,HttpCode,HttpStatus,Inject,Post, UseGuards,Req } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginAuthModels } from '../../core/models/auth-models/login-auth.models.js';
import { CreateUserModels } from '../../core/models/user-models/create-user.models.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import type { Request } from 'express';
import { AuthTokenPayload } from '../../core/types/auth-token-payload.type.js';
import { ChangePasswordModels } from '../../core/models/auth-models/change-password.models.js';

import {ApiTags,ApiOperation,ApiBearerAuth,ApiResponse,ApiBody,} from '@nestjs/swagger';

type AuthenticatedRequest = Request & {
  user: AuthTokenPayload;
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    @Inject(AuthService)
    private readonly authService! : AuthService;


    @ApiOperation({
        summary: 'Register a new user',
        description: 'Creates a new user account.',
    })
    @ApiBody({ type: CreateUserModels })
    @ApiResponse({
        status: 201,
        description: 'User registered successfully.',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data.',
    })
    @ApiResponse({
        status: 409,
        description: 'Email already exists.',
    })
    @Post('register')
    register(@Body() createUserModels : CreateUserModels){
        return this.authService.register(createUserModels)
    }


    @ApiOperation({
        summary: 'User login',
        description: 'Authenticates a user and returns an access token.',
    })
    @ApiBody({ type: LoginAuthModels })
    @ApiResponse({
        status: 200,
        description: 'Login successful.',
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid email or password.',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data.',
    })
    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() loginAuthModels : LoginAuthModels){
        return this.authService.login(loginAuthModels);
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Change user password',
        description: 'Changes the password of the authenticated user.',
    })
    @ApiBody({ type: ChangePasswordModels })
    @ApiResponse({
        status: 200,
        description: 'Password changed successfully.',
    })
    @ApiResponse({
        status: 400,
        description: 'New password must be different from current password.',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized or current password is incorrect.',
    })
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



    @ApiBearerAuth()
    @ApiOperation({
        summary: 'User logout',
        description: 'Invalidates the current access token.',
    })
    @ApiResponse({
        status: 200,
        description: 'Logged out successfully.',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized or invalid token.',
    })
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
