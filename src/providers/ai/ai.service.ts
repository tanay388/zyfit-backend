import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { User } from 'src/models/user/entities/user.entity';
import { Exercise } from 'src/models/exercises/entities/exercise.entity';

interface ExerciseWithDetails {
  id: string;
  sets?: number;
  reps?: number;
  restBetweenSets?: string;
  duration?: string;
  intensity?: 'low' | 'moderate' | 'high';
  exercise?: Exercise;
}

interface DayPlan {
  focus: string;
  warmup?: ExerciseWithDetails[];
  mainWorkout?: ExerciseWithDetails[];
  cooldown?: ExerciseWithDetails[];
  notes?: string;
}

export interface WorkoutPlan {
  weeklyPlan: {
    monday: DayPlan;
    tuesday: DayPlan;
    wednesday: DayPlan;
    thursday: DayPlan;
    friday: DayPlan;
    saturday: DayPlan;
    sunday: DayPlan;
  };
  notes: string;
  weeklyGoals: string[];
}

@Injectable()
export class AIService {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.deepseek.com/v1/chat/completions';

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
  }

  async generateWorkoutPlan(user: User, exercises: Exercise[]) {
    const prompt = this.createWorkoutPlanPrompt(user, exercises);
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
                  'You are a professional fitness trainer and nutritionist. Generate personalized workout plans based on user profiles and available exercises.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const parsedResponse = await this.parseWorkoutPlanResponse(
        response.data.choices[0].message.content,
        exercises,
      );
      return parsedResponse;
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      throw new Error('Failed to generate workout plan');
    }
  }

  private createWorkoutPlanPrompt(user: User, exercises: Exercise[]): string {
    const exercisesList = exercises
      .sort(() => Math.random() - 0.5) // Shuffle array randomly
      .slice(0, Math.min(400, exercises.length)) // Take up to 400 elements
      .map(
        (ex) =>
          `- ${ex.name} (ID: ${ex.id}, Category: ${ex.category}, Level: ${ex.level})`,
      )
      .join('\n');

    return `
Generate a personalized 7-day workout plan for the following user profile:

${user.toAIFormatedPrompt()}

Available exercises:
${exercisesList}

Requirements:
1. Create a structured weekly plan with specific exercises for each day
2. Include rest periods and intensity levels
3. Consider user's fitness level and goals
4. Adapt exercises based on available equipment and workout place
5. Include warm-up and cool-down routines
6. For each exercise, include one or more of:
   - Sets and reps with rest periods between sets
   - Duration 
7. IMPORTANT: For each exercise, you MUST include the exact exercise ID from the available exercises list
8. Return the response in JSON format with the following structure:
{
  "weeklyPlan": {
    "monday": {
      "focus": "string",
      "warmup": [
        {
          "id": "string",
          "duration": "string (optional)",
        }
      ],
      "mainWorkout": [
        {
          "id": "string",
          "sets": number (optional),
          "reps": number (optional),
          "restBetweenSets": "string (optional)",
        }
      ],
      "cooldown": [
        {
          "id": "string",
          "duration": "string (optional)"
        }
      ]
    },
    // ... other days
  },
  "notes": "string",
  "weeklyGoals": ["string"]
}`;
  }

  private async parseWorkoutPlanResponse(
    response: string,
    exercises: Exercise[],
  ): Promise<WorkoutPlan> {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const plan: WorkoutPlan = JSON.parse(jsonMatch[0]);

      // Create a map of exercise IDs to exercise entities for faster lookup
      const exerciseMap = new Map(
        exercises.map((exercise) => [exercise.id, exercise]),
      );

      // Helper function to add exercise entities to exercise details
      const addExerciseEntities = (
        exercises: ExerciseWithDetails[] | undefined,
      ): ExerciseWithDetails[] => {
        if (!exercises) return [];
        return exercises.map((ex) => {
          const exercise = exerciseMap.get(parseInt(ex.id.toString()));
          if (!exercise) {
            console.warn(`Exercise with ID ${ex.id} not found`);
          }
          return {
            ...ex,
            exercise,
          };
        });
      };

      // Process each day in the weekly plan
      Object.entries(plan.weeklyPlan).forEach(([day, dayPlan]) => {
        // Skip processing if it's a rest day with only notes
        if (!dayPlan.warmup && !dayPlan.mainWorkout && !dayPlan.cooldown) {
          return;
        }

        // Add exercise details to each section
        if (dayPlan.warmup) {
          dayPlan.warmup = addExerciseEntities(dayPlan.warmup);
        }
        if (dayPlan.mainWorkout) {
          dayPlan.mainWorkout = addExerciseEntities(dayPlan.mainWorkout);
        }
        if (dayPlan.cooldown) {
          dayPlan.cooldown = addExerciseEntities(dayPlan.cooldown);
        }
      });

      return plan;
    } catch (error) {
      console.error('Error parsing workout plan response:', error);
      throw new Error('Failed to parse workout plan response');
    }
  }
}
