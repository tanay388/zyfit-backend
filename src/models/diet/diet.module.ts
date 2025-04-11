import { Module } from '@nestjs/common';
import { DietService } from './diet.service';
import { DietController } from './diet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Diet } from './entities/diet.entity';
import { AIModule } from 'src/providers/ai/ai.module';
import { MealPlan } from './entities/meal-plan.entity';
import { MealDetails } from './entities/meal-details.entity';
import { DayPlan } from './entities/day-plan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Add your entities here
      Diet, 
      MealPlan,
      MealDetails,
      DayPlan
    ]),
    AIModule
  ],
  controllers: [DietController],
  providers: [DietService],
})
export class DietModule {}
