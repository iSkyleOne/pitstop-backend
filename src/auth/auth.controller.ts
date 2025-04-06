import { Controller, Get, Post, Req, UnauthorizedException, UseGuards, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LocalGuard } from '../guards/auth/local.guard';
import { JwtAccesToken, JwtTokens } from '../interfaces/jwt.interface';
import { HardwareId } from '../database/shemas/hid.schema';
import { JwtAuthGuard } from '../guards/auth/jwt.guard';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
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
		return req.user;
	}

	@Post('logout')
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