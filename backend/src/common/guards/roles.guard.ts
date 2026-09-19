import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleName } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: User has no assigned role');
    }

    // SUPERADMIN has unconditional access
    if (user.role.name === RoleName.SUPERADMIN) {
      return true;
    }

    const hasRole = requiredRoles.includes(user.role.name);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: Required role (${requiredRoles.join(' or ')}) not held by current user (${user.role.name})`,
      );
    }

    return true;
  }
}
