import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { HardwareId } from "../database/shemas/hid.schema";
import { User } from "../database/shemas/user.schema";
import { JwtAccesToken, JwtTokens } from "../interfaces/jwt.interface";
import { UserLoginDto } from "../user/dto/user-login.dto";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
	private maxConnections: number = 3;
	private saltRounds: number = 5;
	constructor(
		private readonly jwtService: JwtService,
		private readonly userService: UserService,
		private readonly configService: ConfigService,
	) {
		this.maxConnections = this.configService.getOrThrow<number>('AUTH_MAX_CONNECTIONS');
		this.saltRounds = parseInt(this.configService.getOrThrow<string>('AUTH_SALT_ROUNDS'));
	}

	public async validateUser(
		email: string,
		password: string,
		hid: HardwareId,
		payload: Partial<UserLoginDto>,
	): Promise<JwtTokens> {
		const user: User | null = await this.userService.fetchByEmail(email);
		
		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		if (!(await user.verifyPassword(password))) {
			throw new UnauthorizedException('Invalid credentials');
		}

		if (!user.active) {
			throw new UnauthorizedException('User is not active');
		}

		let updatedHids = [...user.hids];

		if (updatedHids.length >= this.maxConnections) {
			updatedHids = updatedHids
				.sort(
					(a, b) =>
						new Date(a.timestamp).getTime() -
						new Date(b.timestamp).getTime(),
				)
				.slice(1);
		}
		updatedHids.push(hid);

		await this.userService.update(user._id.toString(), {
			hids: updatedHids,
		});

		const tokenPayload = {
			id: user._id,
			email: user.email,
			rememberMe: payload?.rememberMe ?? false,
		}

		return {
			accessToken: await this.jwtService.signAsync(tokenPayload),
			refreshToken: await this.jwtService.signAsync(
				tokenPayload,
				{
					expiresIn: this.configService.getOrThrow<string>('AUTH_REFRESH_EXPIRY'),
				},
			),
		} as JwtTokens;
	}

	public async validateRefreshToken(
		refreshToken: string,
		hdi: HardwareId,
	): Promise<JwtAccesToken> {
		const payload = await this.jwtService.verifyAsync(refreshToken, {
			secret: this.configService.getOrThrow<string>('AUTH_KEY'),
		});

		const user: User = await this.userService.fetchById(payload.id);

		const currentHdi: HardwareId | null = user.hids.find((_hid: HardwareId) => _hid.ip === hdi.ip && _hid.userAgent === hdi.userAgent) || null;

		if (!currentHdi) {
			throw new UnauthorizedException('FORBIDDEN MOVE. Login again.');
		}

		if (!payload.rememberMe) {
			throw new UnauthorizedException('Remember me not set');
		}

		await this.userService.update(user._id.toString(), {
			hids: user.hids.map((_hid: HardwareId) =>
				_hid.ip === hdi.ip && _hid.userAgent === hdi.userAgent
					? hdi
					: _hid,
			),
		});

		return {
			accessToken: await this.jwtService.signAsync({
				id: user._id,
				email: user.email,
				rememberMe: payload.rememberMe,
			}),
		} as JwtAccesToken;
	}

	public async logout(userId: string, hardwareId: HardwareId): Promise<void> {
		const user = await this.userService.fetchById(userId);

		await this.userService.update(userId, {
			hids: user.hids.filter(
				(_hid: HardwareId) =>
					_hid.ip !== hardwareId.ip &&
					_hid.userAgent !== hardwareId.userAgent,
			),
		});
	}

	public transformToMiliseconds(value: string): number {
		const match = value.match(/^(\d+)([a-zA-Z])$/);

		if (!match) {
			return 0;
		}

		const numberValue = parseInt(match[1], 10);
		const unit = match[2].toLowerCase();

		switch (unit) {
			case 's':
				return numberValue * 1000;
			case 'm':
				return numberValue * 1000 * 60;
			case 'h':
				return numberValue * 1000 * 60 * 60;
			case 'd':
				return numberValue * 1000 * 60 * 60 * 24;
			default:
				return 0;
		}
	}

	public generateHdi(
		userAgent: string,
		ip: string,
		noDate: boolean = false,
	): HardwareId {
		return new HardwareId({
			ip,
			userAgent,
            ...(noDate ? null : { timestamp: new Date() })
		});
	}

	public async isHdiValid(hdi: HardwareId, userId: string): Promise<boolean> {
		const user = await this.userService.fetchById(userId);
		const expiryTime =
			this.configService.getOrThrow<string>('AUTH_HID_EXPIRY');
		const now = new Date();

		const matchingHid = user?.hids.find(
			(_hid: HardwareId) =>
				_hid.ip === hdi.ip &&
				_hid.userAgent === hdi.userAgent &&
				now.getTime() - new Date(_hid.timestamp).getTime() <
					this.transformToMiliseconds(expiryTime),
		);

		return !!matchingHid;
	}

	private async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, this.saltRounds);
	}
}
