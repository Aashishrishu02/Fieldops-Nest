import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Response } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'JWT Access Token and User profile returned' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout the authenticated user' })
  async logout() {
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve currently authenticated user profile and permissions' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth2 authentication redirect' })
  async googleAuth() {
    // Redirects to Google authentication consent screen
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth2 callback redirect' })
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    const token = await this.authService.generateTokenForOAuth(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password for invited users (first login) or token-based reset',
  })
  async resetPassword(
    @CurrentUser('id') authenticatedUserId: string | undefined,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(authenticatedUserId, resetPasswordDto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password for active users (rejected for SYSTEM_GENERATED users)' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, changePasswordDto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset token (blocked for SYSTEM_GENERATED accounts)' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }
}
