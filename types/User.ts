export type User = {
  username: string;
  email: string;
  password: string;
  verified: boolean;
  emailVerificationCode?: string;
  emailVerificationCodeExpiration?: Date;
    resetPasswordToken?: string;
    resetPasswordExpiration?: Date;
  matchPassword(password: string): Promise<boolean>;
};
