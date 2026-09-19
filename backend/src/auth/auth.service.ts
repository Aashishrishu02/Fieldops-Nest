import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CreationType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: email.trim(),
          mode: 'insensitive',
        },
      },
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
      },
    });

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('This account has been deactivated. Please contact administrator.');
    }

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const permissions = user.role.permissions.map((rp: any) => rp.permission.name);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      mustChangePassword: user.mustChangePassword,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
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
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const permissions = user.role.permissions.map((rp: any) => rp.permission.name);

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
      createdAt: user.createdAt,
    };
  }

  async resetPassword(userId: string | undefined, dto: ResetPasswordDto) {
    let targetUserId = userId;

    if (dto.token) {
      // Token-based reset from email
      const resetRecord = await this.prisma.passwordResetToken.findUnique({
        where: { token: dto.token },
        include: { user: true },
      });

      if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
        throw new BadRequestException('Invalid or expired password reset token');
      }

      if (resetRecord.user.creationType === CreationType.SYSTEM_GENERATED) {
        throw new ForbiddenException(
          'System-generated accounts are managed by administrators and cannot reset their passwords.',
        );
      }

      targetUserId = resetRecord.userId;

      // Mark token as used
      await this.prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { used: true },
      });
    }

    if (!targetUserId) {
      throw new BadRequestException('Authentication or reset token is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.creationType === CreationType.SYSTEM_GENERATED) {
      throw new ForbiddenException(
        'System-generated accounts are managed by administrators and cannot reset or change their passwords.',
      );
    }

    // If currentPassword is provided, verify it
    if (dto.currentPassword) {
      const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException('Current temporary password does not match');
      }
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    return {
      message: 'Password has been updated successfully. You can now access your dashboard.',
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.creationType === CreationType.SYSTEM_GENERATED) {
      throw new ForbiddenException(
        'System-generated accounts are managed by administrators and cannot change their password. SuperAdmin can regenerate credentials if necessary.',
      );
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Current password does not match');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: 'Password changed successfully',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: dto.email.trim(),
          mode: 'insensitive',
        },
      },
    });

    // If user doesn't exist, return success to avoid leaking emails
    if (!user) {
      return {
        message: 'If an account exists with this email, password reset instructions have been sent.',
      };
    }

    // Block SYSTEM_GENERATED users from forgot password flow
    if (user.creationType === CreationType.SYSTEM_GENERATED) {
      throw new ForbiddenException(
        'Password reset is disabled for system-generated accounts. Please contact your SuperAdmin to regenerate your credentials.',
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    await this.mailService.sendPasswordResetToken(user.email, token);

    return {
      message: 'If an account exists with this email, password reset instructions have been sent.',
    };
  }

  async generateTokenForOAuth(user: any) {
    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
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
      },
    });

    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }

    const payload = {
      sub: fullUser.id,
      email: fullUser.email,
      role: fullUser.role.name,
      mustChangePassword: fullUser.mustChangePassword,
    };

    return this.jwtService.sign(payload);
  }
}
