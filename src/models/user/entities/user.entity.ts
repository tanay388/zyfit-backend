import { JwtService } from '@nestjs/jwt';
import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { NotificationToken } from 'src/providers/notification/entities/notificationToken.entity';
import { MealType } from 'src/models/diet/entities/diet.entity';

export enum UserRole {
  user = 'user',
  admin = 'admin',
}

export enum Gender {
  male = 'Male',
  female = 'Female',
  preferNotToSay = 'Prefer not to say',
}

export enum UserAgeGroup {
  age18_29 = '18-29',
  age30_39 = '30-39',
  age40_49 = '40-49',
  age50 = '50+',
}

export enum PrimaryGoal {
  build_muscle = 'Build Muscle',
  loose_weight = 'Lose Weight & Shed Fat',
  improve_fitness = 'Improve Fitness',
}

export enum BodyShapes {
  slim = 'Slim',
  average = 'Average (Fit)',
  athletic = 'Athletic',
  athletic_fit = 'Athletic (Fit)',
  muscular = 'Muscular',
  bodybuilder = 'Bodybuilder',
  heavy = 'Heavy',
}

export enum WorkoutPlaces {
  gym = 'Gym',
  home = 'Home',
  both = 'Both',
}

export enum MuscleGroups {
  chest = 'Chest',
  back = 'Back',
  legs = 'Legs',
  arms = 'Arms',
  shoulders = 'Shoulders',
  abs = 'Abs',
  cardio = 'Cardio',
  all = 'All',
}

export enum ProfessionGroups {
  officeWorker = 'Sedentry',
  fieldWorker = 'Mostly Active',
  athletic = 'Athletic',
}

export enum WorkoutLevel {
  beginner = 'beginner',
  intermediate = 'intermediate',
  advanced = 'advanced',
}

@Entity()
export class User extends BaseEntity {
  static from(partial: Partial<User>): User {
    const user = new User();
    Object.assign(user, partial);
    return user;
  }

  @PrimaryColumn()
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ nullable: true })
  name: string;

  @Column({nullable: true})
  dietryPreference: MealType

  @Column({nullable: true})
  city: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({
    type: 'enum',
    enum: UserAgeGroup,
    nullable: true,
  })
  ageGroup: UserAgeGroup;

  @Column({
    type: 'enum',
    enum: PrimaryGoal,
    nullable: true,
  })
  primaryGoal: PrimaryGoal;

  @Column({
    type: 'enum',
    enum: BodyShapes,
    nullable: true,
  })
  bodyShape: BodyShapes;

  @Column({
    type: 'enum',
    enum: BodyShapes,
    nullable: true,
  })
  requiredBodyShape: BodyShapes;

  @Column({
    type: 'enum',
    enum: WorkoutPlaces,
    nullable: true,
  })
  workoutPlace: WorkoutPlaces;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  muscleGroups: MuscleGroups[];

  @Column({
    nullable: true,
  })
  exerciseLevel: string;

  @Column({
    nullable: true,
  })
  exerciseFrequency: number;

  @Column({
    nullable: true,
  })
  exerciseDuration: number;

  @Exclude()
  @Column({
    type: 'enum',
    enum: UserRole,
    default: 'user',
  })
  role: UserRole;

  @OneToMany(() => NotificationToken, (nt) => nt.user, { onDelete: 'CASCADE' })
  notificationTokens: NotificationToken[];

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  issueMuscleGroups: MuscleGroups[];

  @Column({
    type: 'enum',
    enum: ProfessionGroups,
    nullable: true,
  })
  professionGroup: ProfessionGroups;

  @Column({
    nullable: true,
  })
  height: number;

  @Column({
    nullable: true,
  })
  weight: number;

  @Column({
    nullable: true,
  })
  bmi: number;

  @Column({
    nullable: true,
  })
  goalWeight: number;

  @Column({
    nullable: true,
  })
  age: number;

  @Column({
    nullable: true,
  })
  isActive: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  calculate_bmi() {
    if (this.height && this.weight) {
      this.bmi = this.weight / (this.height * this.height);
    }
  }

  toReturnJson() {
    const { id, name, email, phone, photo, role, ageGroup } = this;

    return { id, name, email, phone, photo, role, ageGroup };
  }

  withJWT(jwtService: JwtService) {
    return {
      ...this,
      token: jwtService.sign({
        id: this.id,
        email: this.email,
        role: this.role,
      }),
    };
  }

  toAIFormatedPrompt() {
    return `
    User Proflie: 
    - Gender: ${this.gender}
    - Age Group: ${this.ageGroup}
    - Primary Goal: ${this.primaryGoal}
    - Body Shape: ${this.bodyShape}
    - Required Body Shape: ${this.requiredBodyShape}
    - Workout Place: ${this.workoutPlace}
    - Workout Place: ${this.workoutPlace}
    - Focus Muscle Groups: ${this.muscleGroups}
    - Exercise Level: ${this.exerciseLevel}
    - Exercise Frequency: ${this.exerciseFrequency}
    - Exercise Duration: ${this.exerciseDuration}
    - Profession Group: ${this.professionGroup}
    - Height: ${this.height}
    - Weight: ${this.weight}
    - BMI: ${this.bmi}
    - Goal Weight: ${this.goalWeight}
    `;
  }
}
