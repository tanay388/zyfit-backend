import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { Diet, MealType, MealTime } from './entities/diet.entity';
import { MealPlan } from './entities/meal-plan.entity';
import { DayPlan, DayOfWeek } from './entities/day-plan.entity';
import { MealDetails } from './entities/meal-details.entity';
import { MealPlanService, WeeklyMealPlan } from 'src/providers/ai/meal-plan.service';
import { User } from '../user/entities/user.entity';
import { FirebaseUser } from 'src/providers/firebase/firebase.service';
import { GenerateMealPlanDto } from './dto/generate-meal-plan.dto';

@Injectable()
export class DietService {
  constructor(
    @InjectRepository(Diet)
    private readonly dietRepository: Repository<Diet>,
    @InjectRepository(MealPlan)
    private readonly mealPlanRepository: Repository<MealPlan>,
    @InjectRepository(DayPlan)
    private readonly dayPlanRepository: Repository<DayPlan>,
    @InjectRepository(MealDetails)
    private readonly mealDetailsRepository: Repository<MealDetails>,
    private readonly mealPlanService: MealPlanService,
  ) {}

  async syncIndbData(csvFilePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const records: any[] = [];

      createReadStream(csvFilePath)
        .pipe(
          parse({
            columns: true,
            skip_empty_lines: true,
          })
        )
        .on('data', (record) => {
          records.push({
            foodCode: record.food_code,
            foodName: record.food_name,
            mealType: this.determineMealType(record.meal_type),
            primarySource: record.primarysource,
            energyKj: parseFloat(record.energy_kj),
            energyKcal: parseFloat(record.energy_kcal),
            carbG: parseFloat(record.carb_g),
            proteinG: parseFloat(record.protein_g),
            fatG: parseFloat(record.fat_g),
            freeSugarG: parseFloat(record.freesugar_g),
            fibreG: parseFloat(record.fibre_g),
            sfaMg: parseFloat(record.sfa_mg),
            mufaMg: parseFloat(record.mufa_mg),
            pufaMg: parseFloat(record.pufa_mg),
            cholesterolMg: parseFloat(record.cholesterol_mg),
            servingsUnit: record.servings_unit,
            servingEnergyKj: parseFloat(record.unit_serving_energy_kj),
            servingEnergyKcal: parseFloat(record.unit_serving_energy_kcal),
            servingCarbG: parseFloat(record.unit_serving_carb_g),
            servingProteinG: parseFloat(record.unit_serving_protein_g),
            servingFatG: parseFloat(record.unit_serving_fat_g),
            servingFreeSugarG: parseFloat(record.unit_serving_freesugar_g),
            servingFibreG: parseFloat(record.unit_serving_fibre_g),
            servingSfaMg: parseFloat(record.unit_serving_sfa_mg),
            servingMufaMg: parseFloat(record.unit_serving_mufa_mg),
            servingPufaMg: parseFloat(record.unit_serving_pufa_mg),
            servingCholesterolMg: parseFloat(record.unit_serving_cholesterol_mg),
          });
        })
        .on('end', async () => {
          try {
            for (const record of records) {
              const existingDiet = await this.dietRepository.findOne({
                where: { foodCode: record.foodCode },
              });

              if (existingDiet) {
                await this.dietRepository.update(
                  { id: existingDiet.id },
                  record
                );
              } else {
                await this.dietRepository.save(record);
              }
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  private determineMealType(mealType: string): MealType {
    switch (mealType.toLowerCase()) {
      case 'veg':
        return MealType.VEG;
      case 'egg':
        return MealType.EGG;
      case 'non-veg':
        return MealType.NON_VEG;
      default:
        return MealType.VEG; // Default to VEG if not specified
    }
  }

  async generateAndSaveMealPlan(user: FirebaseUser) {
    const dietItems = await this.findAll();
    const userl = await User.findOneBy({ id: user.uid });
    const savedMeal = await this.mealPlanRepository.findOneBy({ user: { id: userl.id} });

    if (savedMeal) {
      return savedMeal;
    }
    const mealPlanData = await this.mealPlanService.generateMealPlan(userl, dietItems, userl.dietryPreference);
    return this.saveMealPlan(userl, mealPlanData);
  }

  async findAll(): Promise<Diet[]> {
    return this.dietRepository.find();
  }

  async saveMealPlan(user: User, mealPlanData: WeeklyMealPlan): Promise<MealPlan> {
    const mealPlan = this.mealPlanRepository.create({
      user,
      notes: mealPlanData.notes,
      weeklyNutritionGoals: mealPlanData.weeklyNutritionGoals
    });

    await this.mealPlanRepository.save(mealPlan);

    // Create day plans for each day of the week
    for (const [day, dayData] of Object.entries(mealPlanData.weeklyPlan)) {
      const dayPlan = this.dayPlanRepository.create({
        dayOfWeek: day.toLocaleLowerCase() as DayOfWeek,
        totalCalories: dayData.totalCalories,
        notes: dayData.notes,
        mealPlan
      });

      await this.dayPlanRepository.save(dayPlan);

      // Create meal details for each meal time
      const createMealsForTime = async (meals: any[], mealTime: MealTime) => {
        for (const meal of meals) {
          const diet = await this.dietRepository.findOne({ where: { id: parseInt(meal.id) } });
          if (diet) {
            const mealDetails = this.mealDetailsRepository.create({
              mealTime,
              diet,
              servingSize: 1, // Default serving size
              calories: diet.servingEnergyKcal,
              dayPlan
            });
            await this.mealDetailsRepository.save(mealDetails);
          }
        }
      };

      await createMealsForTime(dayData.breakfast, MealTime.BREAKFAST);
      await createMealsForTime(dayData.lunch, MealTime.LUNCH);
      await createMealsForTime(dayData.dinner, MealTime.DINNER);
      if (dayData.snacks) {
        await createMealsForTime(dayData.snacks, MealTime.SNACKS);
      }
    }

    return mealPlan;
  }
}
