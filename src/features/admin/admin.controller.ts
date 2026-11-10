import {
  Controller,
  Get,
  Inject,
  UseGuards,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

import { AdminService } from './admin.module.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';

@ApiTags('Admin Dashboard')
@Controller('admin/dashboard')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  @Inject(AdminService)
  private readonly adminService!: AdminService;

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin dashboard overview' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard overview retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @Get('overview')
  async getOverview() {
    return this.adminService.getOverview();
  }
}