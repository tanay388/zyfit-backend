import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseClassEntity } from 'src/common/entities/base.extend-entity';
import { WorkoutPlan } from './workout-plan.entity';
import { WorkoutExercise } from './workout-exercise.entity';

@Entity('workout_days')
export class WorkoutDay extends BaseClassEntity {
  @Column()
  dayOfWeek: string;

  @Column()
  focus: string;

  @OneToMany(() => WorkoutExercise, (exercise) => exercise.warmupFor, {
    cascade: true,
    eager: true,
  })
  warmup: WorkoutExercise[];

  @OneToMany(() => WorkoutExercise, (exercise) => exercise.mainWorkoutFor, {
    cascade: true,
    eager: true,
  })
  mainWorkout: WorkoutExercise[];

  @OneToMany(() => WorkoutExercise, (exercise) => exercise.cooldownFor, {
    cascade: true,
    eager: true,
  })
  cooldown: WorkoutExercise[];

  @Column({ nullable: true })
  notes?: string;

  @ManyToOne(() => WorkoutPlan, (plan) => plan.days)
  plan: WorkoutPlan;
}