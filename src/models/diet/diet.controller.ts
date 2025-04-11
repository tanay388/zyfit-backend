import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DietService } from './diet.service';
import { FirebaseSecure } from '../user/decorator/firebase.secure.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MealPlanService } from 'src/providers/ai/meal-plan.service';
import { User } from '../user/entities/user.entity';
import { FUser } from '../user/decorator/firebase.user.decorator';
import { GenerateMealPlanDto } from './dto/generate-meal-plan.dto';
import { FirebaseUser } from 'src/providers/firebase/firebase.service';

@Controller('diet')
@FirebaseSecure()
@ApiBearerAuth()
@ApiTags('diet')
export class DietController {
  constructor(
    private readonly dietService: DietService,
    private readonly mealPlanService: MealPlanService,
  ) {}

  @Post('sync')
  async syncIndbData() {
    return this.dietService.syncIndbData('src/models/diet/entities/INDB.csv');
  }

  @Post('meal-plan')
  async generateMealPlan(
    @FUser() user: FirebaseUser,
  ) {
    return this.dietService.generateAndSaveMealPlan(user);
  }
}
