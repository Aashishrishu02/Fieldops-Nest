import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateSystemUserDto } from './dto/create-system-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CreationType } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  private generateSecurePassword(length = 14): string {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*';
    const all = uppercase + lowercase + numbers + symbols;

    // Ensure at least one of each character category
    let password = '';
    password += uppercase[crypto.randomInt(0, uppercase.length)];
    password += lowercase[crypto.randomInt(0, lowercase.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    password += symbols[crypto.randomInt(0, symbols.length)];

    for (let i = 4; i < length; i++) {
      password += all[crypto.randomInt(0, all.length)];
    }

    // Shuffle characters
    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }

  private async generateUniqueSystemEmail(roleName: string): Promise<string> {
    const cleanRole = roleName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    let email = '';
    let exists = true;
    let attempts = 0;

    while (exists && attempts < 10) {
      const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
      email = `${cleanRole}_${randomSuffix}@fieldops.local`;
      const found = await this.prisma.user.findUnique({
        where: { email },
      });
      if (!found) {
        exists = false;
      }
      attempts++;
    }

    return email;
  }

  // ==========================================
  // CASE 1: SYSTEM-GENERATED USER FLOW
  // ==========================================
  async createSystemUser(dto: CreateSystemUserDto) {
    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${dto.roleId}" not found`);
    }

    const generatedEmail = await this.generateUniqueSystemEmail(role.name);
    const plainPassword = this.generateSecurePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        email: generatedEmail,
        name: dto.name || `${role.name.replace(/_/g, ' ')} (${generatedEmail.split('@')[0]})`,
        password: hashedPassword,
        roleId: role.id,
        creationType: CreationType.SYSTEM_GENERATED,
        mustChangePassword: false,
        isActive: true,
      },
      include: {
        role: true,
      },
    });

    // Optionally dispatch credentials if an email was provided
    if (dto.recipientEmailToSendCreds) {
      await this.mailService.sendSystemUserCredentials(
        dto.recipientEmailToSendCreds,
        generatedEmail,
        plainPassword,
        role.name,
      );
    }

    // Return the generated credentials directly for the SuperAdmin UI modal
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        creationType: user.creationType,
        mustChangePassword: user.mustChangePassword,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      credentials: {
        email: generatedEmail,
        password: plainPassword,
        role: role.name,
      },
    };
  }

  // ==========================================
  // CASE 2: INVITED USER FLOW
  // ==========================================
  async inviteUser(dto: InviteUserDto) {
    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${dto.roleId}" not found`);
    }

    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException(`User with email "${email}" already exists`);
    }

    const temporaryPassword = this.generateSecurePassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        name: dto.name || email.split('@')[0],
        password: hashedPassword,
        roleId: role.id,
        creationType: CreationType.INVITED,
        mustChangePassword: true, // Mandatory reset on first login
        isActive: true,
      },
      include: {
        role: true,
      },
    });

    // Dispatch invitation email with temporary password
    try {
      await this.mailService.sendUserInvitation(email, temporaryPassword, role.name);
    } catch (error: any) {
      // Clean up newly created user record so the database is not left in an inconsistent state
      await this.prisma.user.delete({ where: { id: user.id } }).catch(() => {});
      throw new BadRequestException(
        `Failed to send invitation email: ${error.message || 'SMTP delivery failed'}. The user account was not created. Please check your SMTP settings.`,
      );
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        creationType: user.creationType,
        mustChangePassword: user.mustChangePassword,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      temporaryPassword, // Also returned for immediate development/admin verification
    };
  }

  // ==========================================
  // REGENERATE CREDENTIALS (SUPERADMIN ONLY)
  // ==========================================
  async regenerateCredentials(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.creationType !== CreationType.SYSTEM_GENERATED) {
      throw new BadRequestException(
        'Credential regeneration is only applicable to SYSTEM_GENERATED accounts. For invited users, use the standard password reset.',
      );
    }

    const newPlainPassword = this.generateSecurePassword();
    const hashedPassword = await bcrypt.hash(newPlainPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      newPassword: newPlainPassword,
      message: 'New credentials generated successfully. Share them securely with the user.',
    };
  }

  // ==========================================
  // USER LISTING & CRUD
  // ==========================================
  async findAll(query: QueryUsersDto) {
    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.roleId) {
      where.roleId = query.roleId;
    }

    if (query.creationType) {
      where.creationType = query.creationType as CreationType;
    }

    if (query.isActive !== undefined && query.isActive !== '') {
      where.isActive = query.isActive === 'true';
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        role: true,
        _count: {
          select: {
            attendance: true,
            visits: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      creationType: u.creationType,
      mustChangePassword: u.mustChangePassword,
      isActive: u.isActive,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      stats: {
        attendanceCount: u._count.attendance,
        visitsCount: u._count.visits,
      },
    }));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        attendance: {
          take: 5,
          orderBy: { checkIn: 'desc' },
        },
        visits: {
          take: 5,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const permissions = user.role.permissions.map((rp) => rp.permission.name);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
      },
      permissions,
      creationType: user.creationType,
      mustChangePassword: user.mustChangePassword,
      isActive: user.isActive,
      recentAttendance: user.attendance,
      recentVisits: user.visits,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (dto.roleId) {
      const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
      if (!role) {
        throw new NotFoundException(`Role with ID "${dto.roleId}" not found`);
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? dto.name : user.name,
        roleId: dto.roleId !== undefined ? dto.roleId : user.roleId,
        isActive: dto.isActive !== undefined ? dto.isActive : user.isActive,
      },
      include: { role: true },
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      creationType: updated.creationType,
      mustChangePassword: updated.mustChangePassword,
      isActive: updated.isActive,
      updatedAt: updated.updatedAt,
    };
  }

  async toggleActive(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Protect against deactivating the only SUPERADMIN
    if (user.role.name === 'SUPERADMIN' && user.isActive) {
      const superAdminCount = await this.prisma.user.count({
        where: {
          role: { name: 'SUPERADMIN' },
          isActive: true,
        },
      });
      if (superAdminCount <= 1) {
        throw new ForbiddenException('Cannot deactivate the sole active SuperAdmin account');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      include: { role: true },
    });

    return {
      id: updated.id,
      email: updated.email,
      isActive: updated.isActive,
      message: `User account has been ${updated.isActive ? 'activated' : 'deactivated'}`,
    };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (user.role.name === 'SUPERADMIN') {
      const superAdminCount = await this.prisma.user.count({
        where: { role: { name: 'SUPERADMIN' } },
      });
      if (superAdminCount <= 1) {
        throw new ForbiddenException('Cannot delete the sole SuperAdmin account');
      }
    }

    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }
}
