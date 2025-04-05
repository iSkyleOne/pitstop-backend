import { Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LocalGuard } from '../guards/auth/local.guard';
import { JwtAccesToken } from '../interfaces/jwt.interface';
import { HardwareId } from '../database/shemas/hid.schema';
import { JwtAuthGuard } from '../guards/auth/jwt.guard';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService,
	) {}

	@Post('login')
	@UseGuards(LocalGuard)
	public async login(@Req() req: Request, @Res() res: Response) {
		const token = req.user;

		res.cookie('accessToken', token?.['accessToken'], {
			httpOnly: false,
			secure: true,
			sameSite: 'strict',
			maxAge: this.authService.transformToMiliseconds(this.configService.getOrThrow<string>('AUTH_EXPIRY')), // 15min
		});

		res.cookie('refreshToken', token?.['refreshToken'], {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: this.authService.transformToMiliseconds(this.configService.getOrThrow<string>('AUTH_REFRESH_EXPIRY')) // 4h,
		});

		return res.send({ message: 'Login successful' });
	}

	@Post('refresh')
	public async refresh(@Req() req: Request, @Res() res: Response) {
		const refreshToken: string | null = req.cookies?.['refreshToken'];
		const hardwareId: HardwareId = new HardwareId({
			ip: req.ip || req.connection.remoteAddress,
			userAgent: req.get('User-Agent'),
		})

		if (!refreshToken) {
			throw new UnauthorizedException('No refresh token provided');
		}

		try {
			const newToken: JwtAccesToken = await this.authService.validateRefreshToken(refreshToken, hardwareId);

			res.cookie('accessToken', newToken.accessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: this.authService.transformToMiliseconds(this.configService.getOrThrow<string>('AUTH_EXPIRY')), // 15min
			});

			return res.send({ message: 'Token refreshed' });

		} catch (err) {
			throw new UnauthorizedException(err.message);
		}
	}

	@Get('user')
	@UseGuards(JwtAuthGuard)
	public async getCurrentUser(@Req() req: Request) {
		return req.user;
	}

	@Get('logout')
	@UseGuards(JwtAuthGuard)
	public async logout(@Req() req: Request, @Res() res: Response) {
		const hardwareId: HardwareId = new HardwareId({
			ip: req.ip || req.connection.remoteAddress,
			userAgent: req.get('User-Agent'),
		});
		res.clearCookie('accessToken');
		res.clearCookie('refreshToken');

		await this.authService.logout(req.user?.['id'], hardwareId)
		return res.send({ message: 'Logout successful' });
	}
}
