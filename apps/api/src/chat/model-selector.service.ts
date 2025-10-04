import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionPlan, AIProvider } from '@prisma/client';

interface ModelConfig {
  provider: AIProvider;
  modelName: string;
  temperature: number;
  maxTokens: number;
  toolsEnabled: string[];
}

@Injectable()
export class ModelSelectorService {
  constructor(private readonly prisma: PrismaService) {}

  async selectModel(userPlan: SubscriptionPlan): Promise<ModelConfig> {
    // Try to find a policy for the user's plan
    const policies = await this.prisma.modelPolicy.findMany({
      where: { plan: userPlan },
      orderBy: { updatedAt: 'desc' },
    });

    if (policies.length === 0) {
      // Fallback to default policies
      return this.getDefaultModel(userPlan);
    }

    // Prefer anthropic for premium, openai for free
    const preferredProvider = userPlan === 'premium' ? 'anthropic' : 'openai';
    const policy =
      policies.find((p) => p.provider === preferredProvider) || policies[0];

    return {
      provider: policy.provider,
      modelName: policy.modelName,
      temperature: policy.temperature,
      maxTokens: policy.maxTokens,
      toolsEnabled: Array.isArray(policy.toolsEnabledJson)
        ? (policy.toolsEnabledJson as string[])
        : [],
    };
  }

  private getDefaultModel(plan: SubscriptionPlan): ModelConfig {
    if (plan === 'premium') {
      return {
        provider: 'anthropic' as AIProvider,
        modelName: 'claude-3-5-sonnet-20241022',
        temperature: 0.8,
        maxTokens: 4096,
        toolsEnabled: [
          'get_user_metrics',
          'log_water',
          'get_next_period_prediction',
          'create_reminder',
          'get_quota',
        ],
      };
    }

    // Free plan default
    return {
      provider: 'openai' as AIProvider,
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 1024,
      toolsEnabled: ['get_user_metrics', 'get_quota'],
    };
  }

  getSystemPrompt(): string {
    return `Sen "NOVA"sın, bu uygulamanın maskotu ve güvenilir bir arkadaş ve asistansın. Empatik, yargılamayan ve kapsayıcısın.

Kullanıcının izin verdiği verilere (regl döngüsü, su tüketimi, hatırlatıcılar, hamilelik haftası) araçlar aracılığıyla erişebilirsin.

Tıp uzmanı değilsin; asla teşhis koyma; tıbbi endişeler için profesyonel yardım almayı teşvik et.

Hafızaya dayalı önerileri kişiselleştir (yaklaşan regl, hamilelik haftası, hidrasyon hedefi gibi).

Hafızaya yeni kişisel bilgiler kaydetmeden önce her zaman izin iste.

Türkçe konuş.

Kullanıcı rahatlamak isterse, "Günün nasıl geçti?" gibi nazik sorularla aktif dinleme yap.`;
  }
}
