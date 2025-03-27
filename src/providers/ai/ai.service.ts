import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { User } from 'src/models/user/entities/user.entity';
import { Exercise } from 'src/models/exercises/entities/exercise.entity';

@Injectable()
export class AIService {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.deepseek.com/v1/chat/completions';

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
  }

  async generateWorkoutPlan(user: User, exercises: Exercise[]) {
    const prompt = this.createWorkoutPlanPrompt(user, exercises);
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.apiUrl,
          {
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: 'You are a professional fitness trainer and nutritionist. Generate personalized workout plans based on user profiles and available exercises.',
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
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return this.parseWorkoutPlanResponse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      throw new Error('Failed to generate workout plan');
    }
  }

  private createWorkoutPlanPrompt(user: User, exercises: Exercise[]): string {
    return `
Generate a personalized 7-day workout plan for the following user profile:

${user.toAIFormatedPrompt()}

Available exercises:
${exercises.map(ex => `- ${ex.name} (${ex.category}, Level: ${ex.level})`).join('\n')}

Requirements:
1. Create a structured weekly plan with specific exercises for each day
2. Include rest periods and intensity levels
3. Consider user's fitness level and goals
4. Adapt exercises based on available equipment and workout place
5. Include warm-up and cool-down routines
6. Provide sets, reps, and duration for each exercise
7. Return the response in JSON format with the following structure:
{
  "weeklyPlan": {
    "monday": {
      "focus": "string",
      "warmup": ["exercise1", "exercise2"],
      "mainWorkout": [
        {
          "exercise": "string",
          "sets": number,
          "reps": number,
          "restBetweenSets": "string"
        }
      ],
      "cooldown": ["exercise1", "exercise2"]
    },
    // ... other days
  },
  "notes": "string",
  "weeklyGoals": ["string"]
}`;
  }

  private parseWorkoutPlanResponse(response: string) {
    try {
      // Find the JSON object in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error parsing workout plan response:', error);
      throw new Error('Failed to parse workout plan response');
    }
  }
}