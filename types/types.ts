export type User = {
  email: string;
  userId: string;
  username?: string;
};

declare namespace Express {
    export interface Request {
        user?: User;
    }
}
  