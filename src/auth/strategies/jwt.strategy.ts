import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request) => {
                    return request?.cookies?.accessToken;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('AUTH_KEY'),
        });
    }

    public async validate(payload: any): Promise<any> {
        return payload;
    }
}
