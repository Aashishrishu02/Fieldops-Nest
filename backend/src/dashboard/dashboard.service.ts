import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus, VisitStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getRoleDashboardData(currentUser: any) {
    const roleName = currentUser.role?.name || 'FIELD_EMPLOYEE';

    switch (roleName) {
      case 'SUPERADMIN':
        return this.getSuperAdminMetrics();
      case 'MANAGER':
        return this.getManagerMetrics(currentUser.id);
      case 'FIELD_EMPLOYEE':
      default:
        return this.getFieldEmployeeMetrics(currentUser.id);
    }
  }

  // ==========================================
  // SUPERADMIN METRICS
  // ==========================================
  private async getSuperAdminMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      managersCount,
      fieldEmployeesCount,
      todayAttendance,
      todayLate,
      visitsPlanned,
      visitsInProgress,
      visitsCompleted,
      visitsCancelled,
      recentUsers,
      recentVisits,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: { name: 'MANAGER' } } }),
      this.prisma.user.count({ where: { role: { name: 'FIELD_EMPLOYEE' } } }),
      this.prisma.attendance.count({ where: { checkIn: { gte: today } } }),
      this.prisma.attendance.count({
        where: { checkIn: { gte: today }, status: AttendanceStatus.LATE },
      }),
      this.prisma.visit.count({ where: { status: VisitStatus.PLANNED } }),
      this.prisma.visit.count({ where: { status: VisitStatus.IN_PROGRESS } }),
      this.prisma.visit.count({ where: { status: VisitStatus.COMPLETED } }),
      this.prisma.visit.count({ where: { status: VisitStatus.CANCELLED } }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { role: true },
      }),
      this.prisma.visit.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { employee: { select: { id: true, name: true, email: true } } },
      }),
    ]);

    return {
      role: 'SUPERADMIN',
      overview: {
        totalUsers,
        activeUsers,
        managersCount,
        fieldEmployeesCount,
      },
      attendance: {
        todayTotal: todayAttendance,
        todayLate,
        todayOnTime: Math.max(0, todayAttendance - todayLate),
      },
      visits: {
        total: visitsPlanned + visitsInProgress + visitsCompleted + visitsCancelled,
        planned: visitsPlanned,
        inProgress: visitsInProgress,
        completed: visitsCompleted,
        cancelled: visitsCancelled,
      },
      recentUsers: recentUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role.name,
        creationType: u.creationType,
        isActive: u.isActive,
        createdAt: u.createdAt,
      })),
      recentVisits,
    };
  }

  // ==========================================
  // MANAGER METRICS
  // ==========================================
  private async getManagerMetrics(managerId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      teamMembers,
      todayTeamAttendance,
      openVisits,
      inProgressVisits,
      completedVisits,
      recentVisits,
    ] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: { name: 'FIELD_EMPLOYEE' } },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          attendance: {
            where: { checkIn: { gte: today } },
            take: 1,
            orderBy: { checkIn: 'desc' },
          },
        },
      }),
      this.prisma.attendance.count({
        where: {
          checkIn: { gte: today },
          user: { role: { name: 'FIELD_EMPLOYEE' } },
        },
      }),
      this.prisma.visit.count({ where: { status: VisitStatus.PLANNED } }),
      this.prisma.visit.count({ where: { status: VisitStatus.IN_PROGRESS } }),
      this.prisma.visit.count({ where: { status: VisitStatus.COMPLETED } }),
      this.prisma.visit.findMany({
        take: 6,
        orderBy: { date: 'desc' },
        include: { employee: { select: { id: true, name: true, email: true } } },
      }),
    ]);

    return {
      role: 'MANAGER',
      team: {
        totalEmployees: teamMembers.length,
        checkedInToday: todayTeamAttendance,
        members: teamMembers.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          isActive: m.isActive,
          currentStatus: m.attendance[0]?.checkOut ? 'COMPLETED_SHIFT' : m.attendance[0] ? 'CLOCKED_IN' : 'OFFLINE',
        })),
      },
      visits: {
        total: openVisits + inProgressVisits + completedVisits,
        planned: openVisits,
        inProgress: inProgressVisits,
        completed: completedVisits,
      },
      recentVisits,
    };
  }

  // ==========================================
  // FIELD EMPLOYEE METRICS
  // ==========================================
  private async getFieldEmployeeMetrics(userId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [todayAttendance, todayVisits, upcomingVisits, completedVisitsCount] =
      await Promise.all([
        this.prisma.attendance.findFirst({
          where: {
            userId,
            checkIn: { gte: todayStart, lte: todayEnd },
          },
          orderBy: { checkIn: 'desc' },
        }),
        this.prisma.visit.findMany({
          where: {
            assignedTo: userId,
            date: { gte: todayStart, lte: todayEnd },
          },
          orderBy: { date: 'asc' },
        }),
        this.prisma.visit.findMany({
          where: {
            assignedTo: userId,
            date: { gt: todayEnd },
            status: VisitStatus.PLANNED,
          },
          take: 5,
          orderBy: { date: 'asc' },
        }),
        this.prisma.visit.count({
          where: {
            assignedTo: userId,
            status: VisitStatus.COMPLETED,
          },
        }),
      ]);

    return {
      role: 'FIELD_EMPLOYEE',
      attendance: {
        isCheckedIn: todayAttendance ? todayAttendance.checkOut === null : false,
        session: todayAttendance,
      },
      todayVisits,
      upcomingVisits,
      completedVisitsCount,
    };
  }
}
