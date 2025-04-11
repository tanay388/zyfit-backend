import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { DayPlan } from './day-plan.entity';

@Entity('meal_plans')
export class MealPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @OneToMany(() => DayPlan, (dayPlan) => dayPlan.mealPlan, {
    cascade: true,
    eager: true
  })
  days: DayPlan[];

  @Column('text', { nullable: true })
  notes: string;

  @Column('json')
  weeklyNutritionGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}