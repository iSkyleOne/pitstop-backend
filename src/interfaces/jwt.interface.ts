export interface JwtTokens extends JwtAccesToken, JwtRefreshToken {}


export interface JwtAccesToken {
    accessToken: string;
}

export interface JwtRefreshToken {
    refreshToken: string;
}
