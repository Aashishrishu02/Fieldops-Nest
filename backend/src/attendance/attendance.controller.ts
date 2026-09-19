import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PermissionName } from '../common/enums/permission.enum';

@ApiTags('Attendance Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @HttpCode(HttpStatus.OK)
  @Permissions(PermissionName.ATTENDANCE_CREATE)
  @ApiOperation({ summary: 'Clock-in / Start attendance session' })
  async checkIn(@CurrentUser('id') userId: string, @Body() checkInDto: CheckInDto) {
    return this.attendanceService.checkIn(userId, checkInDto);
  }

  @Post('check-out')
  @HttpCode(HttpStatus.OK)
  @Permissions(PermissionName.ATTENDANCE_CREATE)
  @ApiOperation({ summary: 'Clock-out / Complete attendance session' })
  async checkOut(@CurrentUser('id') userId: string, @Body() checkOutDto: CheckOutDto) {
    return this.attendanceService.checkOut(userId, checkOutDto);
  }

  @Get('today')
  @Permissions(PermissionName.ATTENDANCE_VIEW)
  @ApiOperation({ summary: 'Get current user clock-in status for today' })
  async getTodayStatus(@CurrentUser('id') userId: string) {
    return this.attendanceService.getTodayStatus(userId);
  }

  @Get()
  @Permissions(PermissionName.ATTENDANCE_VIEW)
  @ApiOperation({ summary: 'List attendance history with optional filters' })
  async findAll(@Query() query: QueryAttendanceDto, @CurrentUser() currentUser: any) {
    return this.attendanceService.findAll(query, currentUser);
  }

  @Patch(':id')
  @Permissions(PermissionName.ATTENDANCE_UPDATE)
  @ApiOperation({ summary: 'Modify an attendance record (Admin/Manager)' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.attendanceService.update(id, body);
  }
}
