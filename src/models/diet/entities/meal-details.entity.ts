import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DayPlan } from './day-plan.entity';
import { Diet } from './diet.entity';
import { MealTime } from './diet.entity';

@Entity('meal_details')
export class MealDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: MealTime })
  mealTime: MealTime;

  @ManyToOne(() => Diet, { eager: true })
  diet: Diet;

  @Column('float')
  servingSize: number;

  @Column('float')
  calories: number;

  @ManyToOne(() => DayPlan, (dayPlan) => dayPlan.meals)
  dayPlan: DayPlan;
}