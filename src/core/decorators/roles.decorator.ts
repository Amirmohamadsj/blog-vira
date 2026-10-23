import { SetMetadata } from "@nestjs/common";
import type { AuthTokenPayload } from "../types/auth-token-payload.type.js";

export const ROLES_KEY = 'roles';

export const Roles = (...roles : AuthTokenPayload['role'][]) =>
    SetMetadata(ROLES_KEY,roles)
