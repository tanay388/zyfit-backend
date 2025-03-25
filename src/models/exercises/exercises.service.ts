import { Injectable } from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Exercise } from './entities/exercise.entity';

@Injectable()
export class ExercisesService {
  create(createExerciseDto: CreateExerciseDto) {
    return 'This action adds a new exercise';
  }

  findAll() {
    return Exercise.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} exercise`;
  }

  update(id: number, updateExerciseDto: UpdateExerciseDto) {
    return `This action updates a #${id} exercise`;
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
