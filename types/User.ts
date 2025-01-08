export type User = {
  username: string;
  email: string;
  password: string;
  verified: boolean;
  emailVerificationCode?: string;
  emailVerificationCodeExpiration?: Date;
  matchPassword(password: string): Promise<boolean>;
};
