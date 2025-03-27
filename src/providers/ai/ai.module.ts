import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}