import { Module } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { AIModule } from 'src/providers/ai/ai.module';

@Module({
  imports: [AIModule],
  controllers: [ExercisesController],
  providers: [ExercisesService],
})
export class ExercisesModule {}