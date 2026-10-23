
export type AuthTokenPayload = {
  sub: number;
  role: 'user' | 'admin';
  exp? : number
};
