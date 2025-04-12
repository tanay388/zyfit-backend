import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/models/user/entities/user.entity';
import { Diet, MealTime, MealType } from 'src/models/diet/entities/diet.entity';
import { MealPlan } from 'src/models/diet/entities/meal-plan.entity';

interface MealWithDetails {
  id: string;
  diet?: Diet;
  mealTime?: MealTime;
}

interface DayMealPlan {
  totalCalories: number;
  breakfast: MealWithDetails[];
  lunch: MealWithDetails[];
  dinner: MealWithDetails[];
  snacks?: MealWithDetails[];
  notes?: string;
}

export interface WeeklyMealPlan {
  weeklyPlan: {
    monday: DayMealPlan;
    tuesday: DayMealPlan;
    wednesday: DayMealPlan;
    thursday: DayMealPlan;
    friday: DayMealPlan;
    saturday: DayMealPlan;
    sunday: DayMealPlan;
  };
  notes: string;
  weeklyNutritionGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
}

@Injectable()
export class MealPlanService {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.deepseek.com/v1/chat/completions';

  constructor(private httpService: HttpService) {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
  }

  async generateMealPlan(user: User, dietItems: Diet[], mealType: MealType) {
    const prompt = this.createMealPlanPrompt(user, dietItems, mealType);
    console.log(prompt);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.apiUrl,
          {
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content:
                  'You are a professional nutritionist. Generate personalized meal plans based on user profiles, dietary preferences, and available food items. Please keep in mind to not recommend non-veg items more than 1 time a day and 2 days a week. Also include atleast 1 food food suitable for summer season and regional to Jharkhand, Bihar. IMPORTANT: You must ONLY return a valid JSON object without any additional text or explanation.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 3000,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const parsedResponse = await this.parseMealPlanResponse(
        response.data.choices[0].message.content,
        dietItems,
      );
      return parsedResponse;
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      throw new Error('Failed to generate meal plan');
    }
  }

  private createMealPlanPrompt(user: User, dietItems: Diet[], mealType: MealType): string {
    // Filter diet items based on meal type preference
    const filteredDietItems = dietItems.filter(item => {
      switch (mealType) {
        case MealType.VEG:
          return item.mealType === MealType.VEG;
        case MealType.EGG:
          return item.mealType === MealType.VEG || item.mealType === MealType.EGG;
        case MealType.NON_VEG:
          return true; // Include all items for non-veg
        default:
          return item.mealType === MealType.VEG; // Default to VEG if not specified
      }
    });

    const dietItemsList = filteredDietItems
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(400, filteredDietItems.length))
      .map(item => item.toAiPrompt())
      .join('\n');

    return `
Generate a personalized 7-day meal plan for the following user profile:

${user.toAIFormatedPrompt()}

Dietary Preference: ${mealType}

Available food items:
${dietItemsList}

Requirements:
1. Create a structured weekly meal plan with specific meals for each day
2. Include breakfast, lunch, dinner, and optional snacks
3. Consider user's caloric needs and nutritional goals
4. Adapt meals based on dietary preference (${mealType})
6. For each meal item, you MUST include the exact food ID from the available food items list
7. Return the response in JSON format with the following structure:
{
  "weeklyPlan": {
    "monday": {
      "totalCalories": number,
      "breakfast": [
        {
          "id": "string",
          "mealTime": "breakfast" | "lunch" | "dinner" | "snacks"
        }
      ],
      "lunch": [...],
      "dinner": [...],
      "snacks": [...]
    },
    // ... other days
  },
  "notes": "string",
  "weeklyNutritionGoals": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fats": number,
    "fiber": number
  }
}`;
  }

  private async parseMealPlanResponse(
    response: string,
    dietItems: Diet[],
  ): Promise<WeeklyMealPlan> {
    try {
      // Extract JSON from the response if it contains additional text
      const jsonMatch = response.match(/\{[\s\S]*\}/); 
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const plan = JSON.parse(jsonMatch[0]);
      
      // Validate the required structure
      if (!plan.weeklyPlan || !plan.weeklyNutritionGoals || typeof plan.notes !== 'string') {
        throw new Error('Invalid meal plan structure');
      }

      // Create a map of diet IDs to diet entities for faster lookup
      const dietMap = new Map(dietItems.map((diet) => [diet.id, diet]));

      // Helper function to add diet entities to meal details
      const addDietEntities = (meals: MealWithDetails[] | undefined): MealWithDetails[] => {
        if (!meals) return [];
        return meals.map((meal) => {
          const diet = dietMap.get(parseInt(meal.id.toString()));
          if (!diet) {
            console.warn(`Diet item with ID ${meal.id} not found`);
          }
          return {
            ...meal,
            diet,
          };
        });
      };

      // Process each day in the weekly plan
      Object.entries(plan.weeklyPlan).forEach(([day, dayPlan]: [string, DayMealPlan]) => {
        dayPlan.breakfast = addDietEntities(dayPlan.breakfast);
        dayPlan.lunch = addDietEntities(dayPlan.lunch);
        dayPlan.dinner = addDietEntities(dayPlan.dinner);
        if (dayPlan.snacks) {
          dayPlan.snacks = addDietEntities(dayPlan.snacks);
        }
      });

      return plan;
    } catch (error) {
      console.error('Error parsing meal plan response:', error);
      throw new Error('Failed to parse meal plan response: ' + error.message);
    }
  }
}