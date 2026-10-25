import { Controller, Inject, Param, ParseIntPipe,Get, Post, Body, Patch, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserModels } from '../../core/models/user-models/create-user.models.js';
import { UpdateUserModels } from '../../core/models/user-models/update-user.models.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';
import { AuthTokenPayload } from '../../core/types/auth-token-payload.type.js';
import { UpdateUserRoleModels } from '../../core/models/user-models/update-user-role.models.js';


type AuthenticatedRequest = Request & {
  user: AuthTokenPayload;
};


@Controller('users')
export class UsersController {

    @Inject(UsersService)
    private readonly userService! : UsersService;

    @UseGuards(AuthGuard,RolesGuard)
    @Roles('admin')   
    @Get()
    getUsers(){
        return this.userService.getUsers();
    }

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

    @UseGuards(AuthGuard,RolesGuard)
    @Roles('admin')
    @Delete(':id')
    deleteUser(
        @Param('id',ParseIntPipe) id : number,
    ){
        return this.userService.deleteUser(id)
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @Patch(':id/role')
    updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserRoleModels,
    ) {
    return this.userService.updateUserRole(id, body.role);
    }
}
