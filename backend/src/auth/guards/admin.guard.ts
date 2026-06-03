import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_ADMIN_KEY } from '../../common/decorators/is-admin.decorators.js';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireAdmin = this.reflector.getAllAndOverride<boolean>(
      IS_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requireAdmin) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user && user.role === 'ADMIN') return true;
    throw new ForbiddenException(
      'Bạn đã truy cập nhầm trang. Vui lòng quay lại trang chủ',
    );
  }
}
