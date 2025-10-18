import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Guard to check if user has admin privileges
 * Used for moderation actions
 * 
 * Admin users are identified by:
 * - Email domain: @admin.wellnesscompanion.com
 * - Or specific admin emails from environment variable
 */
@Injectable()
export class AdminGuard implements CanActivate {
    private readonly adminEmails: string[];

    constructor(private prisma: PrismaService) {
        // Load admin emails from environment variable
        const envAdmins = process.env.ADMIN_EMAILS || '';
        this.adminEmails = envAdmins.split(',').map(email => email.trim()).filter(Boolean);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;

        if (!userId) {
            throw new ForbiddenException('Kimlik doğrulaması gerekli');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
        });

        if (!user) {
            throw new ForbiddenException('Kullanıcı bulunamadı');
        }

        // Check if user is admin
        const isAdmin = this.isAdminUser(user.email);

        if (!isAdmin) {
            throw new ForbiddenException('Bu işlem için admin yetkisi gerekli');
        }

        return true;
    }

    private isAdminUser(email: string): boolean {
        // Check if email is in admin list
        if (this.adminEmails.includes(email)) {
            return true;
        }

        // Check if email has admin domain
        if (email.endsWith('@admin.wellnesscompanion.com')) {
            return true;
        }

        return false;
    }
}
