import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  mustChangePassword?: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fieldops-super-secure-jwt-secret-key-production-ready-2026',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
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

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User is deactivated or no longer exists');
    }

    const permissions = user.role?.permissions.map((rp) => rp.permission.name) || [];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      role: {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
      },
      permissions,
      creationType: user.creationType,
      mustChangePassword: user.mustChangePassword,
      isActive: user.isActive,
    };
  }
}
