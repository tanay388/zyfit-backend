import { Injectable } from '@nestjs/common';
import { Exercise } from './entities/exercise.entity';
import { FirebaseUser } from 'src/providers/firebase/firebase.service';
import { User } from '../user/entities/user.entity';
import { AIService } from 'src/providers/ai/ai.service';

@Injectable()
export class ExercisesService {
  constructor(private readonly aiService: AIService) {}

  async generatePlan(firebaseUser: FirebaseUser) {
    // Get user profile
    const user = await User.findOne({ where: { id: firebaseUser.uid } });
    if (!user) {
      throw new Error('User not found');
    }

    // Get available exercises
    const exercises = await Exercise.find();
    if (!exercises.length) {
      throw new Error('No exercises available');
    }

    // Generate workout plan using AI
    return this.aiService.generateWorkoutPlan(user, exercises);
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
}