import { Controller, Get, Post, Req, UnauthorizedException, UseGuards, Body, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LocalGuard } from '../guards/auth/local.guard';
import { JwtAccesToken, JwtTokens } from '../interfaces/jwt.interface';
import { HardwareId } from '../database/shemas/hid.schema';
import { JwtAuthGuard } from '../guards/auth/jwt.guard';
import { User } from '../database/shemas/user.schema';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
	) {}

	@Post('login')
	@UseGuards(LocalGuard)
	public async login(@Req() req: Request): Promise<JwtTokens> {
		const tokens = req.user as JwtTokens;
		
		return tokens;
	}

	@Post('refresh')
	public async refresh(@Body() body: { refreshToken: string }, @Req() req: Request): Promise<JwtAccesToken> {
		const refreshToken: string | null = body.refreshToken;
		const hardwareId: HardwareId = new HardwareId({
			ip: req.ip || req.connection.remoteAddress,
			userAgent: req.get('User-Agent'),
		});

		if (!refreshToken) {
			throw new UnauthorizedException('No refresh token provided');
		}

		try {
			const newToken: JwtAccesToken = await this.authService.validateRefreshToken(refreshToken, hardwareId);

			return newToken;

		} catch (err) {
			throw new UnauthorizedException(err.message);
		}
	}

	@Get('user')
	@UseGuards(JwtAuthGuard)
	public async getCurrentUser(@Req() req: Request): Promise<any> {
		const userId = (req.user as any)?.id;
		const user: User = await this.userService.fetchById(userId);

		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		if (user.password) delete user.password;

		return user;
	}

	@Post('request-reset-password')
	public async requestResetPassword(@Body() body: { email: string, port: string }): Promise<void> {
		await this.authService.requestResetPassword(body.email, body.port);
	}

	@Post('reset-password')
	public async resetPassword(@Body('userId') userId: string, @Body('token') token: string, @Body('password') password: string): Promise<void> {
		console.log('userId', userId);
		console.log('token', token);
		console.log('password', password);
		await this.authService.resetPassword(userId, token, password);
	}

	@Get('logout')
	@UseGuards(JwtAuthGuard)
	public async logout(@Req() req: Request) {
		const hardwareId: HardwareId = new HardwareId({
			ip: req.ip || req.connection.remoteAddress,
			userAgent: req.get('User-Agent'),
		});

		await this.authService.logout(req.user?.['id'], hardwareId);
		return { message: 'Logout successful' };
	}
}