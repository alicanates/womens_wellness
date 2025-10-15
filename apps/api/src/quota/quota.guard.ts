import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { QuotaService } from './quota.service';

@Injectable()
export class QuotaGuard implements CanActivate {
  constructor(private readonly quotaService: QuotaService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('Kimlik doğrulama gerekli');
    }

    // Get detailed quota status
    const quota = await this.quotaService.getStatus(user.id);

    // Check if quota is exceeded
    if (quota.used >= quota.limit) {
      // Format reset date in Turkish
      const resetDate = new Date(quota.resetsAt);
      const formattedDate = resetDate.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      throw new ForbiddenException({
        code: 'QUOTA_EXCEEDED',
        message: `Aylık mesaj kotanız doldu (${quota.used}/${quota.limit}). Yeni ay: ${formattedDate}`,
        messageEn: `Monthly message quota exceeded (${quota.used}/${quota.limit}). Resets on: ${resetDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`,
        quota: {
          used: quota.used,
          limit: quota.limit,
          remaining: quota.remaining,
          resetsAt: quota.resetsAt,
          percentage: quota.percentage,
        },
      });
    }

    return true;
  }
}
