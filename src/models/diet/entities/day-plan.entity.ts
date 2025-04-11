import { Entity, Column, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MealPlan } from './meal-plan.entity';
import { MealDetails } from './meal-details.entity';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday'
}

@Entity('day_plans')
export class DayPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: DayOfWeek })
  dayOfWeek: DayOfWeek;

  @Column('float')
  totalCalories: number;

  @Column('text', { nullable: true })
  notes?: string;

  @ManyToOne(() => MealPlan, (mealPlan) => mealPlan.days)
  mealPlan: MealPlan;

  @OneToMany(() => MealDetails, (meal) => meal.dayPlan, {
    cascade: true,
    eager: true
  })
  meals: MealDetails[];
}