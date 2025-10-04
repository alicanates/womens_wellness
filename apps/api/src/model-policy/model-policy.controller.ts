import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ModelPolicyService } from './model-policy.service';

@Controller('model-policies')
@UseGuards(AuthGuard('jwt'))
export class ModelPolicyController {
  constructor(private readonly modelPolicyService: ModelPolicyService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.modelPolicyService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.modelPolicyService.findOne(id);
  }

  @Post()
  async create(
    @Body()
    data: {
      plan: 'free' | 'premium';
      provider: 'openai' | 'anthropic' | 'google';
      modelName: string;
      temperature: number;
      maxTokens: number;
      toolsEnabledJson?: string[];
    },
  ) {
    return this.modelPolicyService.create(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    data: {
      plan?: 'free' | 'premium';
      provider?: 'openai' | 'anthropic' | 'google';
      modelName?: string;
      temperature?: number;
      maxTokens?: number;
      toolsEnabledJson?: string[];
    },
  ) {
    return this.modelPolicyService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.modelPolicyService.delete(id);
  }
}
