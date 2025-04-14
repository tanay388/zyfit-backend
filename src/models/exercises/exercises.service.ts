import { Injectable } from '@nestjs/common';
import { Exercise } from './entities/exercise.entity';
import { FirebaseUser } from 'src/providers/firebase/firebase.service';
import {
  User,
  BodyShapes,
  WorkoutLevel,
  PrimaryGoal,
  ProfessionGroups,
} from '../user/entities/user.entity';
import { AIService } from 'src/providers/ai/ai.service';
import { WorkoutPlan } from './entities/workout-plan.entity';

@Injectable()
export class ExercisesService {
  constructor(private readonly aiService: AIService) {}

  async generatePlan(firebaseUser: FirebaseUser) {
    // Get user profile
    const user = await User.findOne({ where: { id: firebaseUser.uid } });
    if (!user) {
      throw new Error('User not found');
    }

    const userLevel = this.getWorkoutLevel(user);

    const existingPlan = await WorkoutPlan.findOne({
      where: { userId: user.id },
    });

    if (existingPlan) {
      return existingPlan;
    }

    // Get available exercises
    const exercises = await Exercise.find({
      where: { level: userLevel.toLowerCase() },
    });

    if (!exercises.length) {
      throw new Error('No exercises available');
    }

    console.log(`Found ${exercises.length} exercises for level ${userLevel}`);

    // Generate workout plan using AI
    const aiResponse = await this.aiService.generateWorkoutPlan(
      user,
      exercises,
    );

    // Save the workout plan
    const workoutPlan = await WorkoutPlan.createFromResponse(
      user.id,
      aiResponse,
    );

    return await WorkoutPlan.findOne({
      where: { id: workoutPlan.id },
    });
  }

  findAll() {
    return Exercise.find();
  }

  findOne(id: number) {
    return Exercise.findOne({ where: { id } });
  }

  remove(id: number) {
    return Exercise.delete(id);
  }

  // @Cron(CronExpression.EVERY_10_HOURS)
  async syncExercises() {
    const exercisesRawList = await fetch(
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json',
    );

    const exercises = await exercisesRawList.json();

    const mappedExercises = exercises.map((exercise) => {
      const { id, ...exerciseWithoutId } = exercise;
      return {
        ...exerciseWithoutId,
        exerciseId: id,
        images: exercise.images.map(
          (image) =>
            `https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises/${image}`,
        ),
      };
    });

    // Save to database
    await Exercise.save(mappedExercises);

    return mappedExercises;
  }

  getWorkoutLevel(user: User) {
    // Calculate BMI
    const heightInMeters = user.height / 100; // Convert height from cm to meters
    const bmi = user.weight / (heightInMeters * heightInMeters);

    // Determine BMI factor
    let bmiFactor: number;
    if (bmi < 18.5) {
      bmiFactor = 0.3; // Underweight
    } else if (bmi >= 18.5 && bmi < 24.9) {
      bmiFactor = 0.5; // Normal weight
    } else if (bmi >= 25 && bmi < 29.9) {
      bmiFactor = 0.7; // Overweight
    } else {
      bmiFactor = 1; // Obese
    }

    // Factor 2: Body Shape
    const bodyShapeFactor =
      user.bodyShape === BodyShapes.heavy || user.bodyShape === BodyShapes.slim
        ? 0
        : 1;
    // Factor 3: Exercise Level
    const exerciseLevelFactor =
      user.exerciseLevel === WorkoutLevel.beginner
        ? 0
        : user.exerciseLevel === WorkoutLevel.intermediate
          ? 1
          : 2;
    // Factor 4: Primary Goal
    const primaryGoalFactor =
      user.primaryGoal === PrimaryGoal.loose_weight ? 0 : 1;
    // Factor 5: Age
    const ageFactor = user.age && user.age < 40 ? 1 : 0;
    // Factor 6: Profession Group
    const professionFactor =
      user.professionGroup === ProfessionGroups.athletic ? 1 : 0;

    // Calculate a score based on the factors
    const score =
      bmiFactor * 0.3 +
      bodyShapeFactor * 0.2 +
      exerciseLevelFactor * 0.2 +
      primaryGoalFactor * 0.1 +
      ageFactor * 0.1 +
      professionFactor * 0.1;

    // Determine workout level based on the score
    if (score < 1) {
      return WorkoutLevel.beginner;
    } else if (score >= 1 && score < 2) {
      return WorkoutLevel.intermediate;
    } else {
      return WorkoutLevel.advanced;
    }
  }
}
