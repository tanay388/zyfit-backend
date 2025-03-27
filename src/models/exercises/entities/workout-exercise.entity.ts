import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseClassEntity } from 'src/common/entities/base.extend-entity';
import { Exercise } from './exercise.entity';
import { WorkoutDay } from './workout-day.entity';

export enum WorkoutIntensity {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
}

@Entity('workout_exercises')
export class WorkoutExercise extends BaseClassEntity {
  @Column()
  exerciseId: number;

  @ManyToOne(() => Exercise, { eager: true })
  exercise: Exercise;

  @Column({ nullable: true })
  sets?: number;

  @Column({ nullable: true })
  reps?: number;

  @Column({ nullable: true })
  restBetweenSets?: string;

  @Column({ nullable: true })
  duration?: string;

  @Column({ type: 'enum', enum: WorkoutIntensity, nullable: true })
  intensity?: WorkoutIntensity;

  @ManyToOne(() => WorkoutDay, (day) => day.warmup)
  warmupFor: WorkoutDay;

  @ManyToOne(() => WorkoutDay, (day) => day.mainWorkout)
  mainWorkoutFor: WorkoutDay;

  @ManyToOne(() => WorkoutDay, (day) => day.cooldown)
  cooldownFor: WorkoutDay;
}
