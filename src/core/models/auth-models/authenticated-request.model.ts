import type { Request } from 'express';
import { AuthTokenPayload } from '../../types/auth-token-payload.type.js';


export type AuthenticatedRequest = Request & {
  user: AuthTokenPayload;
};