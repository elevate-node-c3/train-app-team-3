export interface IJwtUserPayload {
  sub: string;
  email: string;
  sid: string;
  // level: AccessLevel;
}

export interface IDecodedJwtPayload extends IJwtUserPayload {
  iat: number;
  exp: number;
  jti: string;
}
export interface IToken {
  accessToken: string;
  refreshToken: string;
}
export enum TokenType {
  ACCESS = "ACCESS",
  REFRESH = "REFRESH",
}
