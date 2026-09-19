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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { UpdateVisitStatusDto } from './dto/update-visit-status.dto';
import { QueryVisitsDto } from './dto/query-visits.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PermissionName } from '../common/enums/permission.enum';

@ApiTags('Field Visits Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  @Permissions(PermissionName.VISIT_CREATE)
  @ApiOperation({ summary: 'Schedule and dispatch a new field visit' })
  async create(@Body() createVisitDto: CreateVisitDto) {
    return this.visitsService.create(createVisitDto);
  }

  @Get()
  @Permissions(PermissionName.VISIT_VIEW)
  @ApiOperation({ summary: 'List visits (filtered by user scope or query parameters)' })
  async findAll(@Query() query: QueryVisitsDto, @CurrentUser() currentUser: any) {
    return this.visitsService.findAll(query, currentUser);
  }

  @Get(':id')
  @Permissions(PermissionName.VISIT_VIEW)
  @ApiOperation({ summary: 'Get details for a specific visit' })
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.visitsService.findOne(id, currentUser);
  }

  @Patch(':id')
  @Permissions(PermissionName.VISIT_UPDATE)
  @ApiOperation({ summary: 'Update visit scheduling details or notes' })
  async update(
    @Param('id') id: string,
    @Body() updateVisitDto: UpdateVisitDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.visitsService.update(id, updateVisitDto, currentUser);
  }

  @Patch(':id/status')
  @Permissions(PermissionName.VISIT_UPDATE)
  @ApiOperation({ summary: 'Update visit progress status (PLANNED -> IN_PROGRESS -> COMPLETED/CANCELLED)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateVisitStatusDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.visitsService.updateStatus(id, dto, currentUser);
  }

  @Delete(':id')
  @Permissions(PermissionName.VISIT_DELETE)
  @ApiOperation({ summary: 'Delete or cancel a field visit' })
  async remove(@Param('id') id: string) {
    return this.visitsService.remove(id);
  }
}
