export interface JwtTokens extends JwtAccesToken, JwtRefreshToken {}

export interface JwtAccesToken {
    accessToken: string;
}

export interface JwtRefreshToken {
    refreshToken: string;
}

export interface JwtPayload {
    id: string;
    email: string;
    rememberMe: boolean;
    iat?: number;
    exp?: number;
}