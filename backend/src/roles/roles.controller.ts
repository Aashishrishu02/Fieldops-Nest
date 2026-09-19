import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PermissionName } from '../common/enums/permission.enum';

@ApiTags('Role Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Permissions(PermissionName.ROLE_VIEW)
  @ApiOperation({ summary: 'List all defined roles and their assigned permissions' })
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Permissions(PermissionName.ROLE_VIEW)
  @ApiOperation({ summary: 'Get details and permissions for a specific role' })
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @Permissions(PermissionName.ROLE_CREATE)
  @ApiOperation({ summary: 'Create a new custom role' })
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Patch(':id')
  @Permissions(PermissionName.ROLE_UPDATE)
  @ApiOperation({ summary: 'Update role metadata or permissions' })
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Post(':id/permissions')
  @HttpCode(HttpStatus.OK)
  @Permissions(PermissionName.PERMISSION_ASSIGN)
  @ApiOperation({ summary: 'Assign permission matrix to a role' })
  async assignPermissions(
    @Param('id') id: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.rolesService.assignPermissions(id, assignPermissionsDto);
  }

  @Delete(':id')
  @Permissions(PermissionName.ROLE_DELETE)
  @ApiOperation({ summary: 'Delete a custom role' })
  async remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
