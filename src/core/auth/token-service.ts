import { AuthTokenPayload } from "../types/auth-token-payload.type.js";

export abstract class TokenService {
    abstract sign(payload : AuthTokenPayload):Promise<string>;

    abstract verify(token: string): Promise<AuthTokenPayload>;
}