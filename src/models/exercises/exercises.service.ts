import { Injectable } from '@nestjs/common';
import { Exercise } from './entities/exercise.entity';
import {
  BodyShapes,
  PrimaryGoal,
  ProfessionGroups,
  User,
  WorkoutLevel,
} from '../user/entities/user.entity';
import { FirebaseUser } from 'src/providers/firebase/firebase.service';

@Injectable()
export class ExercisesService {
  async generatePlan(user: FirebaseUser) {
    return 'This action adds a new exercise';
  }

  findAll() {
    return Exercise.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} exercise`;
  }

  remove(id: number) {
    return `This action removes a #${id} exercise`;
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

  getWorkoutLevel(user: User): WorkoutLevel {
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
