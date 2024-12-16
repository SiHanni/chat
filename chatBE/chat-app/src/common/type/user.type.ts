export type JWTPayload = {
  subject: number;
  email: string;
  token_type: string;
  exp?: number;
};
