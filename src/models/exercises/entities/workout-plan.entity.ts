import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseClassEntity } from 'src/common/entities/base.extend-entity';
import { User } from 'src/models/user/entities/user.entity';
import { WorkoutDay } from './workout-day.entity';
import { WorkoutExercise } from './workout-exercise.entity';

@Entity('workout_plans')
export class WorkoutPlan extends BaseClassEntity {
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE', eager: true })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => WorkoutDay, (day) => day.plan, {
    cascade: true,
    eager: true,
  })
  days: WorkoutDay[];

  @Column('text')
  notes: string;

  @Column('simple-array')
  weeklyGoals: string[];

  static async createFromResponse(
    userId: string,
    response: any,
  ): Promise<WorkoutPlan> {
    const plan = new WorkoutPlan();
    plan.userId = userId;
    plan.notes = response.notes;
    plan.weeklyGoals = response.weeklyGoals;

    // Create days
    plan.days = await Promise.all(
      Object.entries(response.weeklyPlan).map(
        async ([dayName, dayData]: [string, any]) => {
          const day = new WorkoutDay();
          day.dayOfWeek = dayName;
          day.focus = dayData.focus;
          day.notes = dayData.notes;

          // Create exercises for each section
          if (dayData.warmup) {
            day.warmup = await Promise.all(
              dayData.warmup.map(async (ex: any) => {
                const exercise = new WorkoutExercise();
                exercise.exerciseId = ex.exercise.id;
                exercise.duration = ex.duration;
                exercise.intensity = ex.intensity;
                return exercise;
              }),
            );
          }

          if (dayData.mainWorkout) {
            day.mainWorkout = await Promise.all(
              dayData.mainWorkout.map(async (ex: any) => {
                const exercise = new WorkoutExercise();
                exercise.exerciseId = ex.exercise.id;
                exercise.sets = ex.sets;
                exercise.reps = ex.reps;
                exercise.restBetweenSets = ex.restBetweenSets;
                exercise.duration = ex.duration;
                exercise.intensity = ex.intensity;
                return exercise;
              }),
            );
          }

          if (dayData.cooldown) {
            day.cooldown = await Promise.all(
              dayData.cooldown.map(async (ex: any) => {
                const exercise = new WorkoutExercise();
                exercise.exerciseId = ex.exercise.id;
                exercise.duration = ex.duration;
                return exercise;
              }),
            );
          }

          return day;
        },
      ),
    );

    return plan.save();
  }
}
