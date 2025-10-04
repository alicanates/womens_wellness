import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { QuotaService } from './quota.service';

@Injectable()
export class QuotaGuard implements CanActivate {
  constructor(private readonly quotaService: QuotaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has quota
    const hasQuota = await this.quotaService.hasQuota(user.id);

    if (!hasQuota) {
      throw new ForbiddenException({
        code: 'QUOTA_EXCEEDED',
        message: 'Aylık mesaj limitinize ulaştınız.',
        messageEn: 'Monthly message quota exceeded.',
      });
    }

    return true;
  }
}
