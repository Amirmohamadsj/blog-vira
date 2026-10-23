import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../core/entities/user.entity.js';
import { Repository } from 'typeorm';
import { CreateUserModels } from '../../core/models/create-user.models.js';
import bcrypt from "bcrypt"
import { UpdateUserModels } from '../../core/models/update-user.models.js';
import { UserRole } from '../../core/enum/user-role.enum.js';

@Injectable()
export class UsersService {

    @InjectRepository(User)
    private readonly userRepository! : Repository<User>

    async getUsers(){
        const user = await this.userRepository.find()

        return user
    }

    async getUser(id : number){
        const user = await this.userRepository.findOne({
            where : {id}
        })

        if(!user){
            throw new NotFoundException('User not found');
        }

        return user
    }


    async createUser(creaeteUserModels : CreateUserModels){
        const user = await this.userRepository.findOne({
            where : {email : creaeteUserModels.email}
        });

        if(user){
            throw new ConflictException('Email already exists')
        }

        const hashedPassword = await bcrypt.hash(creaeteUserModels.password,10)

        const newuser = {
            ...creaeteUserModels,
            password : hashedPassword
        }

        const savedUser = await this.userRepository.save(newuser)

        const {password , ...safeUser} = savedUser;

        return safeUser
    }

    async updateUser(
        id: number,
        updateUserModels: UpdateUserModels,
        requesterId: number,
        requesterRole: 'user' | 'admin',
        ) {
        if (requesterRole !== 'admin' && requesterId !== id) {
            throw new ForbiddenException(
            'You can only update your own profile',
            );
        }

        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (updateUserModels.password) {
            updateUserModels.password = await bcrypt.hash(
            updateUserModels.password,
            10,
            );
        }

        await this.userRepository.update(id, updateUserModels);

        const updatedUser = await this.userRepository.findOne({
            where: { id },
        });

        return updatedUser;
    }


    async deleteUser(id:number){
        const user = await this.userRepository.findOne({
            where :{id}
        })

        if(!user){
            throw new NotFoundException('not found user')
        }

        const userdelete = await this.userRepository.delete(id)

        return userdelete
    }


    async getByUserEmail(email:string){
        const user = await this.userRepository.findOne({
            where : {email}
        })


        if(!user){
            throw new NotFoundException('User not found');
        }

        return user
    }


    async getUserForAuth(email : string){
        return this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.email = :email' , {email})
        .getOne();
    }


    async updateUserRole(id:number,role: UserRole){
        const user = await this.userRepository.findOne({
            where : {id},
        });

        if(!user){
                throw new NotFoundException('User not found');
        }

        user.role = role;
        await this.userRepository.save(user);

        return{
            id : user.id,
            username : user.username,
            email : user.email,
            role : user.role
        }
    }

}
