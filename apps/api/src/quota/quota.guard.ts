import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { QuotaService } from './quota.service';

/**
 * Guard to check AI message quota
 * Integrated with subscription system to enforce quota limits
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 */
@Injectable()
export class QuotaGuard implements CanActivate {
  constructor(private readonly quotaService: QuotaService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('Kimlik doğrulama gerekli');
    }

    // Get detailed quota status (now integrated with subscription)
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
        message: `Aylık mesaj kotanız doldu (${quota.used}/${quota.limit}). Premium'a geçerek sınırsız mesaj gönderin. Yeni ay: ${formattedDate}`,
        messageEn: `Monthly message quota exceeded (${quota.used}/${quota.limit}). Upgrade to premium for unlimited messages. Resets on: ${resetDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`,
        quota: {
          used: quota.used,
          limit: quota.limit,
          remaining: quota.remaining,
          resetsAt: quota.resetsAt,
          percentage: quota.percentage,
        },
        upgradeRequired: quota.limit < 1000, // Suggest upgrade if not premium
      });
    }

    return true;
  }
}
