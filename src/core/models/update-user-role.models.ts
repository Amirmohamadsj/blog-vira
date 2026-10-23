import { IsEnum } from 'class-validator';
import { UserRole } from '../enum/user-role.enum.js';

export class UpdateUserRoleModels {
  @IsEnum(UserRole)
  role: UserRole;
}