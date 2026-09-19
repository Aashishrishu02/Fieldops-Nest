import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { UpdateVisitStatusDto } from './dto/update-visit-status.dto';
import { QueryVisitsDto } from './dto/query-visits.dto';
import { VisitStatus } from '@prisma/client';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVisitDto) {
    const employee = await this.prisma.user.findUnique({
      where: { id: dto.assignedTo },
    });

    if (!employee) {
      throw new NotFoundException(`Assigned user with ID "${dto.assignedTo}" not found`);
    }

    const visit = await this.prisma.visit.create({
      data: {
        assignedTo: dto.assignedTo,
        customerName: dto.customerName,
        location: dto.location,
        date: new Date(dto.date),
        purpose: dto.purpose,
        status: dto.status || VisitStatus.PLANNED,
        notes: dto.notes,
      },
      include: {
        employee: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return visit;
  }

  async findAll(query: QueryVisitsDto, currentUser: any) {
    const where: any = {};

    const isSuperAdmin = currentUser.role?.name === 'SUPERADMIN';
    const isManager = currentUser.role?.name === 'MANAGER';

    // Restrict field employees to visits assigned directly to them
    if (!isSuperAdmin && !isManager) {
      where.assignedTo = currentUser.id;
    } else if (query.assignedTo) {
      where.assignedTo = query.assignedTo;
    }

    if (query.status) {
      where.status = query.status as VisitStatus;
    }

    if (query.search) {
      where.OR = [
        { customerName: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
        { purpose: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) {
        where.date.gte = new Date(`${query.startDate}T00:00:00.000Z`);
      }
      if (query.endDate) {
        where.date.lte = new Date(`${query.endDate}T23:59:59.999Z`);
      }
    }

    const visits = await this.prisma.visit.findMany({
      where,
      include: {
        employee: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    return visits;
  }

  async findOne(id: string, currentUser: any) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: {
        employee: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID "${id}" not found`);
    }

    const isSuperAdmin = currentUser.role?.name === 'SUPERADMIN';
    const isManager = currentUser.role?.name === 'MANAGER';

    if (!isSuperAdmin && !isManager && visit.assignedTo !== currentUser.id) {
      throw new ForbiddenException('Access denied: You are not assigned to this field visit');
    }

    return visit;
  }

  async update(id: string, dto: UpdateVisitDto, currentUser: any) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) {
      throw new NotFoundException(`Visit with ID "${id}" not found`);
    }

    const isSuperAdmin = currentUser.role?.name === 'SUPERADMIN';
    const isManager = currentUser.role?.name === 'MANAGER';

    if (!isSuperAdmin && !isManager && visit.assignedTo !== currentUser.id) {
      throw new ForbiddenException('Access denied: You cannot edit visits assigned to others');
    }

    const updated = await this.prisma.visit.update({
      where: { id },
      data: {
        assignedTo: dto.assignedTo !== undefined ? dto.assignedTo : visit.assignedTo,
        customerName: dto.customerName !== undefined ? dto.customerName : visit.customerName,
        location: dto.location !== undefined ? dto.location : visit.location,
        date: dto.date ? new Date(dto.date) : visit.date,
        purpose: dto.purpose !== undefined ? dto.purpose : visit.purpose,
        status: dto.status !== undefined ? dto.status : visit.status,
        notes: dto.notes !== undefined ? dto.notes : visit.notes,
      },
      include: {
        employee: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return updated;
  }

  async updateStatus(id: string, dto: UpdateVisitStatusDto, currentUser: any) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) {
      throw new NotFoundException(`Visit with ID "${id}" not found`);
    }

    const isSuperAdmin = currentUser.role?.name === 'SUPERADMIN';
    const isManager = currentUser.role?.name === 'MANAGER';

    if (!isSuperAdmin && !isManager && visit.assignedTo !== currentUser.id) {
      throw new ForbiddenException('Access denied: You cannot update status of visits assigned to others');
    }

    const newNotes = dto.notes
      ? visit.notes
        ? `${visit.notes}\n[${new Date().toLocaleTimeString()}]: ${dto.notes}`
        : dto.notes
      : visit.notes;

    const updated = await this.prisma.visit.update({
      where: { id },
      data: {
        status: dto.status,
        notes: newNotes,
      },
      include: {
        employee: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return updated;
  }

  async remove(id: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) {
      throw new NotFoundException(`Visit with ID "${id}" not found`);
    }

    await this.prisma.visit.delete({ where: { id } });
    return { message: 'Visit deleted successfully' };
  }
}
