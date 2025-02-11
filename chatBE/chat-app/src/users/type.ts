export type JWTPayload = {
  subject: number;
  username: string;
  iat: number;
  exp: number;
};

export type ChangePwdInput = {
  inputedOldPwd: string;
  newPwd: string;
};
