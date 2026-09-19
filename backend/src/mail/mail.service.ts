import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER || process.env.SMTP_USERNAME;
    const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

    if (host && user && pass) {
      try {
        const secure =
          process.env.SMTP_SECURE === 'true' ||
          (process.env.SMTP_SECURE === undefined && port === 465);

        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: {
            user,
            pass,
          },
          connectionTimeout: 10000, // 10s: Fail fast if host is unreachable / firewalled
          greetingTimeout: 10000,   // 10s: Fail fast if greeting response stalls
          socketTimeout: 15000,     // 15s: Fail fast if socket transmission stalls
          tls: {
            rejectUnauthorized: process.env.SMTP_IGNORE_TLS === 'true' ? false : true,
          },
        });
        this.logger.log(`📧 SMTP Transporter configured for ${host}:${port} (${user}) [secure=${secure}]`);
      } catch (err: any) {
        this.logger.warn(`Failed to initialize SMTP transporter: ${err.message}. Fallback to console logger.`);
      }
    } else {
      this.logger.log('ℹ️ No complete SMTP configuration provided (requires SMTP_HOST, SMTP_USER, SMTP_PASS/SMTP_PASSWORD). Outgoing emails will be logged to console.');
    }
  }

  async sendSystemUserCredentials(
    recipientEmail: string,
    generatedEmail: string,
    plainPassword: string,
    roleName: string,
  ): Promise<boolean> {
    const subject = `[FieldOps] System-Generated Credentials for Role: ${roleName}`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const loginUrl = `${frontendUrl}/login`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #1e293b; margin-bottom: 8px;">FieldOps Management System</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 0;">System Account Provisioned</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p style="color: #334155; font-size: 15px;">Your administrator has generated a new managed account for you in FieldOps with the role: <strong>${roleName}</strong>.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Generated Login Email / Username:</strong></p>
          <code style="font-size: 16px; color: #0284c7; font-weight: 600; display: block; margin-bottom: 12px;">${generatedEmail}</code>
          
          <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Generated Password:</strong></p>
          <code style="font-size: 16px; color: #0284c7; font-weight: 600; display: block;">${plainPassword}</code>
        </div>

        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #92400e;">
          <strong>Security Policy:</strong> This is a centrally-managed system account. Passwords cannot be modified by the user directly. Contact your SuperAdmin for any credential rotation.
        </div>

        <p style="margin-top: 24px;">
          <a href="${loginUrl}" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">Log in to FieldOps</a>
        </p>
      </div>
    `;

    try {
      return await this.sendMail(recipientEmail, subject, htmlContent, {
        type: 'SYSTEM_GENERATED_CREDENTIALS',
        generatedEmail,
        plainPassword,
        roleName,
      });
    } catch (err: any) {
      this.logger.warn(`Optional credentials copy email could not be sent to ${recipientEmail}: ${err.message}`);
      return false;
    }
  }

  async sendUserInvitation(
    recipientEmail: string,
    temporaryPassword: string,
    roleName: string,
  ): Promise<boolean> {
    const subject = `[FieldOps] You've been invited to join FieldOps as ${roleName}`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const loginUrl = `${frontendUrl}/login`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #1e293b; margin-bottom: 8px;">Welcome to FieldOps!</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 0;">Account Invitation</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p style="color: #334155; font-size: 15px;">You have been invited to join the FieldOps platform with the role: <strong>${roleName}</strong>.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Login Email:</strong></p>
          <code style="font-size: 16px; color: #0284c7; font-weight: 600; display: block; margin-bottom: 12px;">${recipientEmail}</code>
          
          <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Temporary Password:</strong></p>
          <code style="font-size: 16px; color: #0284c7; font-weight: 600; display: block;">${temporaryPassword}</code>
        </div>

        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #1e40af;">
          <strong>Action Required:</strong> Upon your first login, the system will prompt you to replace this temporary password with your own secure password before accessing the dashboard.
        </div>

        <p style="margin-top: 24px;">
          <a href="${loginUrl}" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">Proceed to Login</a>
        </p>
      </div>
    `;

    return this.sendMail(recipientEmail, subject, htmlContent, {
      type: 'USER_INVITATION',
      recipientEmail,
      temporaryPassword,
      roleName,
      loginUrl,
    });
  }

  async sendPasswordResetToken(recipientEmail: string, resetToken: string): Promise<boolean> {
    const subject = `[FieldOps] Password Reset Request`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(recipientEmail)}`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #1e293b;">FieldOps Password Reset</h2>
        <p style="color: #334155;">We received a request to reset your password. Click the button below to set a new password. This link expires in 1 hour.</p>
        <p style="margin-top: 24px;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">Reset Password</a>
        </p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    return this.sendMail(recipientEmail, subject, htmlContent, {
      type: 'PASSWORD_RESET',
      resetToken,
      resetUrl,
    });
  }

  private async sendMail(
    to: string,
    subject: string,
    html: string,
    metadata?: Record<string, any>,
  ): Promise<boolean> {
    const user = process.env.SMTP_USER || process.env.SMTP_USERNAME;
    const from =
      process.env.SMTP_FROM ||
      (user && user.includes('@') ? `FieldOps <${user}>` : 'FieldOps <no-reply@fieldops.local>');

    if (this.transporter) {
      try {
        await Promise.race([
          this.transporter.sendMail({
            from,
            to,
            subject,
            html,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SMTP dispatch timed out after 15 seconds')), 15000),
          ),
        ]);
        this.logger.log(`✅ Email dispatched successfully to: ${to} (Subject: ${subject})`);
        return true;
      } catch (error: any) {
        this.logger.error(`❌ Failed to dispatch email via SMTP to ${to}: ${error.message}`);
        throw new Error(`Email delivery failed: ${error.message}`);
      }
    }

    // Console logger fallback when no SMTP is configured (e.g. local dev)
    this.logger.log('==================== OUTGOING EMAIL (CONSOLE FALLBACK) ====================');
    this.logger.log(`To:      ${to}`);
    this.logger.log(`Subject: ${subject}`);
    if (metadata) {
      this.logger.log(`Details: ${JSON.stringify(metadata, null, 2)}`);
    }
    this.logger.log('===========================================================================');
    return true;
  }
}
