export interface Player {
  id: number;
  username: string;
  password: string;
  sessionHash?: string;
  registrationDate: Date;
  isAdmin: number;
  isBanned: number;
}
