import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async checkIn(userId: string, dto: CheckInDto) {
    // Check if user currently has an open session
    const openRecord = await this.prisma.attendance.findFirst({
      where: {
        userId,
        checkOut: null,
      },
    });

    if (openRecord) {
      throw new BadRequestException(
        'You already have an active check-in session. Please check out before checking in again.',
      );
    }

    const now = new Date();
    // Rule: standard shift starts at 09:30 AM
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hours > 9 || (hours === 9 && minutes > 30);

    const record = await this.prisma.attendance.create({
      data: {
        userId,
        checkIn: now,
        status: isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
        notes: dto.notes,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return {
      message: isLate
        ? 'Checked in successfully (Recorded as Late arrival).'
        : 'Checked in successfully (On time).',
      attendance: record,
    };
  }

  async checkOut(userId: string, dto: CheckOutDto) {
    const openRecord = await this.prisma.attendance.findFirst({
      where: {
        userId,
        checkOut: null,
      },
      orderBy: { checkIn: 'desc' },
    });

    if (!openRecord) {
      throw new BadRequestException('No active check-in session found to check out from.');
    }

    const checkOutTime = new Date();
    const durationHours =
      (checkOutTime.getTime() - openRecord.checkIn.getTime()) / (1000 * 60 * 60);

    let status = openRecord.status;
    if (durationHours < 4 && status === AttendanceStatus.PRESENT) {
      status = AttendanceStatus.HALF_DAY;
    }

    const updated = await this.prisma.attendance.update({
      where: { id: openRecord.id },
      data: {
        checkOut: checkOutTime,
        status,
        notes: dto.notes
          ? openRecord.notes
            ? `${openRecord.notes} | Out: ${dto.notes}`
            : dto.notes
          : openRecord.notes,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return {
      message: 'Checked out successfully. Session completed.',
      durationHours: Number(durationHours.toFixed(2)),
      attendance: updated,
    };
  }

  async getTodayStatus(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const records = await this.prisma.attendance.findMany({
      where: {
        userId,
        checkIn: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { checkIn: 'desc' },
    });

    const activeSession = records.find((r) => r.checkOut === null) || null;

    return {
      isCheckedIn: !!activeSession,
      currentSession: activeSession,
      todayRecords: records,
    };
  }

  async findAll(query: QueryAttendanceDto, currentUser: any) {
    const where: any = {};

    // If currentUser is FIELD_EMPLOYEE without team view access, restrict to self
    const isSuperAdmin = currentUser.role?.name === 'SUPERADMIN';
    const isManager = currentUser.role?.name === 'MANAGER';

    if (!isSuperAdmin && !isManager) {
      where.userId = currentUser.id;
    } else if (query.userId) {
      where.userId = query.userId;
    }

    if (query.status) {
      where.status = query.status as AttendanceStatus;
    }

    if (query.startDate || query.endDate) {
      where.checkIn = {};
      if (query.startDate) {
        where.checkIn.gte = new Date(`${query.startDate}T00:00:00.000Z`);
      }
      if (query.endDate) {
        where.checkIn.lte = new Date(`${query.endDate}T23:59:59.999Z`);
      }
    }

    const records = await this.prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { checkIn: 'desc' },
    });

    return records;
  }

  async update(id: string, data: any) {
    const record = await this.prisma.attendance.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Attendance record with ID "${id}" not found`);
    }

    const updated = await this.prisma.attendance.update({
      where: { id },
      data: {
        status: data.status,
        notes: data.notes,
        checkIn: data.checkIn ? new Date(data.checkIn) : undefined,
        checkOut: data.checkOut ? new Date(data.checkOut) : undefined,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return updated;
  }
}
