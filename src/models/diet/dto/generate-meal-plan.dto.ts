import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { MealType } from '../entities/diet.entity';

export class GenerateMealPlanDto {
  @ApiProperty({
    enum: MealType,
    description: 'Type of meal to generate plan for',
  })
  @IsEnum(MealType)
  mealType: MealType;
}