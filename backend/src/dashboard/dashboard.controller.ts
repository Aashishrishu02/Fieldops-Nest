import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PermissionName } from '../common/enums/permission.enum';

@ApiTags('Dashboard Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Permissions(PermissionName.DASHBOARD_VIEW)
  @ApiOperation({ summary: 'Get role-tailored dashboard metrics and summaries' })
  async getDashboardStats(@CurrentUser() currentUser: any) {
    return this.dashboardService.getRoleDashboardData(currentUser);
  }
}
