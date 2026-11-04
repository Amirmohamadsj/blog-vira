import {
  Controller,
  Get,
  Inject,
  UseGuards,
} from '@nestjs/common';

import { AdminService } from './admin.module.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';

@Controller('admin/dashboard')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  @Inject(AdminService)
  private readonly adminService!: AdminService;

  @Get('overview')
  async getOverview() {
    return this.adminService.getOverview();
  }
}