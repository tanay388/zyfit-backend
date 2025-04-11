import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { MealPlanService } from './meal-plan.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [AIService, MealPlanService],
  exports: [AIService, MealPlanService],
})
export class AIModule {}