import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreationType } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private prisma: PrismaService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_google_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_google_client_secret',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, emails, displayName } = profile;
      const email = emails?.[0]?.value?.toLowerCase();

      if (!email) {
        return done(new Error('No email found in Google OAuth profile'), false);
      }

      // Check if user already exists
      let user = await this.prisma.user.findFirst({
        where: {
          OR: [{ googleId: id }, { email }],
        },
        include: {
          role: true,
        },
      });

      if (user) {
        // Link googleId if not yet linked
        if (!user.googleId) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { googleId: id },
            include: { role: true },
          });
        }
      } else {
        // Find default role FIELD_EMPLOYEE - Never assign SUPERADMIN to unknown Google accounts
        let employeeRole = await this.prisma.role.findUnique({
          where: { name: 'FIELD_EMPLOYEE' },
        });

        if (!employeeRole) {
          employeeRole = await this.prisma.role.create({
            data: {
              name: 'FIELD_EMPLOYEE',
              description: 'Field Employee role',
            },
          });
        }

        // Create a random password hash since this is OAuth
        const dummyPass = await bcrypt.hash(Math.random().toString(36) + Date.now().toString(), 10);

        user = await this.prisma.user.create({
          data: {
            email,
            name: displayName || 'Google User',
            googleId: id,
            password: dummyPass,
            roleId: employeeRole.id,
            creationType: CreationType.INVITED,
            mustChangePassword: false,
            isActive: true,
          },
          include: { role: true },
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
}
