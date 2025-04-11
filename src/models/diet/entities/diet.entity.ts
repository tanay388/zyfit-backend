import { Entity, Column } from 'typeorm';
import { BaseClassEntity } from 'src/common/entities/base.extend-entity';

export enum MealType {
  VEG = 'veg',
  EGG = 'egg',
  NON_VEG = 'non-veg'
}

export enum MealTime {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACKS = 'snacks'
}

@Entity('diets')
export class Diet extends BaseClassEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  foodCode: string;

  @Column({ type: 'varchar', length: 255 })
  foodName: string;

  @Column({ type: 'enum', enum: MealType })
  mealType: MealType;

  @Column({ type: 'varchar', length: 255 })
  primarySource: string;

  // Energy details
  @Column({ type: 'float' })
  energyKj: number;

  @Column({ type: 'float' })
  energyKcal: number;

  // Macronutrients (per 100g/ml)
  @Column({ type: 'float' })
  carbG: number;

  @Column({ type: 'float' })
  proteinG: number;

  @Column({ type: 'float' })
  fatG: number;

  @Column({ type: 'float' })
  freeSugarG: number;

  @Column({ type: 'float' })
  fibreG: number;

  @Column({ type: 'float' })
  sfaMg: number;

  @Column({ type: 'float' })
  mufaMg: number;

  @Column({ type: 'float' })
  pufaMg: number;

  @Column({ type: 'float' })
  cholesterolMg: number;

  // Serving information
  @Column({ type: 'varchar', length: 50 })
  servingsUnit: string;

  // Per serving nutrients
  @Column({ type: 'float' })
  servingEnergyKj: number;

  @Column({ type: 'float' })
  servingEnergyKcal: number;

  @Column({ type: 'float' })
  servingCarbG: number;

  @Column({ type: 'float' })
  servingProteinG: number;

  @Column({ type: 'float' })
  servingFatG: number;

  @Column({ type: 'float' })
  servingFreeSugarG: number;

  @Column({ type: 'float' })
  servingFibreG: number;

  @Column({ type: 'float' })
  servingSfaMg: number;

  @Column({ type: 'float' })
  servingMufaMg: number;

  @Column({ type: 'float' })
  servingPufaMg: number;

  @Column({ type: 'float' })
  servingCholesterolMg: number;

  toAiPrompt(): string {
    return `${this.id}|${this.foodName}|${this.servingEnergyKcal}kcal|P:${this.servingProteinG}g|F:${this.servingFatG}g|S:${this.servingFreeSugarG}g|Fb:${this.servingFibreG}g`;
  }
}