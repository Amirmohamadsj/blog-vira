import { CanActivate,ExecutionContext,ForbiddenException,Inject,Injectable,UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthTokenPayload } from "../types/auth-token-payload.type.js";
import { ROLES_KEY } from "../decorators/roles.decorator.js";
import { Observable } from "rxjs";

@Injectable()
export class RolesGuard implements CanActivate {
  @Inject(Reflector)
  private readonly reflector! : Reflector;

  canActivate(context: ExecutionContext): boolean{
    const roles = this.reflector.getAllAndOverride<AuthTokenPayload['role'][]>
    (ROLES_KEY , [context.getHandler(), context.getClass()]);

    if(!roles || roles.length === 0){
      return true
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthTokenPayload }>();

    if(!request.user){
      throw new UnauthorizedException();
    }


    if(!roles.includes(request.user.role)){
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}