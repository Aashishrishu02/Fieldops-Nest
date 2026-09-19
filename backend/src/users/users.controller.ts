import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateSystemUserDto } from './dto/create-system-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PermissionName } from '../common/enums/permission.enum';

@ApiTags('User Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('system-generated')
  @Permissions(PermissionName.USER_CREATE)
  @ApiOperation({
    summary: 'Case 1: Generate a managed user account with auto-generated email & secure password',
  })
  @ApiResponse({ status: 201, description: 'User created and plaintext credentials returned' })
  async createSystemUser(@Body() createSystemUserDto: CreateSystemUserDto) {
    return this.usersService.createSystemUser(createSystemUserDto);
  }

  @Post('invite')
  @Permissions(PermissionName.USER_CREATE)
  @ApiOperation({
    summary: 'Case 2: Invite an existing email, send temporary credentials and enforce password reset',
  })
  @ApiResponse({ status: 201, description: 'User created and invitation dispatched' })
  async inviteUser(@Body() inviteUserDto: InviteUserDto) {
    return this.usersService.inviteUser(inviteUserDto);
  }

  @Post(':id/regenerate-credentials')
  @HttpCode(HttpStatus.OK)
  @Permissions(PermissionName.USER_UPDATE)
  @ApiOperation({
    summary: 'Regenerate credentials for a SYSTEM_GENERATED user account (SuperAdmin only)',
  })
  async regenerateCredentials(@Param('id') id: string) {
    return this.usersService.regenerateCredentials(id);
  }

  @Get()
  @Permissions(PermissionName.USER_VIEW)
  @ApiOperation({ summary: 'List all users with optional filtering and search' })
  async findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Permissions(PermissionName.USER_VIEW)
  @ApiOperation({ summary: 'Retrieve full user profile, role, permissions and recent activities' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Permissions(PermissionName.USER_UPDATE)
  @ApiOperation({ summary: 'Update user name, assigned role, or status' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/toggle-active')
  @Permissions(PermissionName.USER_UPDATE)
  @ApiOperation({ summary: 'Activate or deactivate a user account' })
  async toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }

  @Delete(':id')
  @Permissions(PermissionName.USER_DELETE)
  @ApiOperation({ summary: 'Delete a user account' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
