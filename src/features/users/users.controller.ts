import { Controller, Inject, Param, ParseIntPipe,Get, Post, Body, Patch, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserModels } from '../../core/models/user-models/create-user.models.js';
import { UpdateUserModels } from '../../core/models/user-models/update-user.models.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';
import { AuthTokenPayload } from '../../core/types/auth-token-payload.type.js';
import { UpdateUserRoleModels } from '../../core/models/user-models/update-user-role.models.js';
import type { Request } from 'express';
import {ApiTags,ApiOperation,ApiBearerAuth,ApiParam,ApiBody,ApiResponse} from '@nestjs/swagger';



type AuthenticatedRequest = Request & {
  user: AuthTokenPayload;
};

@ApiTags('Users')
@Controller('users')
export class UsersController {

    @Inject(UsersService)
    private readonly userService! : UsersService;


    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get all users',
        description: 'Retrieves all users. Admin access only.',
    })
    @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Admin access required.' })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles('admin')   
    @Get()
    getUsers(){
        return this.userService.getUsers();
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get my profile',
        description: 'Retrieves the profile of the authenticated user.',
    })
    @ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @UseGuards(AuthGuard)
    @Get('me')
    getMyProfile(
        @Req() request: AuthenticatedRequest,
    ) {
        return this.userService.getUser(
            Number(request.user.sub),
        );
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get user by ID',
        description: 'Retrieves a user by ID. Users can only access their own profile unless they are admins.',
    })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid user ID.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'You can only access your own profile.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @UseGuards(AuthGuard)
    @Get(':id')
    getUser(
        @Param('id',ParseIntPipe) id : number,
        @Req() request:AuthenticatedRequest
    ){
        const requesterId = request.user.sub;
        const requesterRole = request.user.role;

        if(requesterRole !== 'admin' && requesterId !== id){
            throw new ForbiddenException('You can only access your own profile');

        }    
        return this.userService.getUser(id);
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update my profile',
        description: 'Updates the profile of the authenticated user.',
    })
    @ApiBody({ type: UpdateUserModels })
    @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @UseGuards(AuthGuard)
    @Patch('me')
    updateMyProfile(
        @Body() updateUserModels: UpdateUserModels,
        @Req() request: AuthenticatedRequest,
    ) {
        return this.userService.updateUser(
            Number(request.user.sub),
            updateUserModels,
            Number(request.user.sub),
            request.user.role,
        );
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update user',
        description: 'Updates a user. Regular users can only update their own profile; admins can update any user.',
    })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: UpdateUserModels })
    @ApiResponse({ status: 200, description: 'User updated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @UseGuards(AuthGuard)
    @Patch(':id')
    updateUser(
        @Param('id',ParseIntPipe) id : number,
        @Body() updateUserModels : UpdateUserModels,
        @Req() request: AuthenticatedRequest,
    ){
        return this.userService.updateUser(id,
            updateUserModels,
            request.user.sub,
            request.user.role,
        )
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Delete user',
        description: 'Deletes a user. Admin access only.',
    })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiResponse({ status: 200, description: 'User deleted successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid user ID.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Admin access required or self-deletion is not allowed.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles('admin')
    @Delete(':id')
    deleteUser(
        @Param('id',ParseIntPipe) id : number,
        @Req() request:Request & { user : AuthTokenPayload}
    ){
        return this.userService.deleteUser(id,Number(request.user.sub))
    }

    
}
