export type JWTPayload = {
  subject: number;
  username: string;
  iat: number;
  exp: number;
};
