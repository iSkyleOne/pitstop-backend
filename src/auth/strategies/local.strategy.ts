import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { Request } from "express";
import { JwtTokens } from "../../interfaces/jwt.interface";
import { UserLoginDto } from "../../user/dto/user-login.dto";
import { HardwareId } from "../../database/shemas/hid.schema";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService,
    ) {
        super({
            usernameField: 'email',
            passReqToCallback: true,
        });
    }

    public async validate(req: Request, email: string, password: string): Promise<JwtTokens> {
        const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || '';
		const userAgent = req.get('User-Agent') || '';
		const hdi: HardwareId = this.authService.generateHdi(userAgent, ip);
        const payload: UserLoginDto = (req.body as UserLoginDto);

        const user: JwtTokens = await this.authService.validateUser(email, password, hdi, payload);

        if (!user) {
            throw new UnauthorizedException('Date de autentificare invalide!');
        }

        return user;
    }
}