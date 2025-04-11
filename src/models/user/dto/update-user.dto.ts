import { PartialType } from '@nestjs/mapped-types';
import { SignUpUserDto } from './signup-user.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsNumber,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Gender,
  UserAgeGroup,
  PrimaryGoal,
  BodyShapes,
  WorkoutPlaces,
  MuscleGroups,
  ProfessionGroups,
  UserRole,
} from '../entities/user.entity';
import { Diet, MealType } from 'src/models/diet/entities/diet.entity';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    
  })
  @IsOptional()
  @IsEnum(MealType)
  dietryPreference: MealType;

  @ApiPropertyOptional({

  })
  @IsOptional()
  @IsString()
  city: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photo: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ enum: UserAgeGroup, required: false })
  @IsOptional()
  @IsEnum(UserAgeGroup)
  ageGroup: UserAgeGroup;

  @ApiProperty({ enum: PrimaryGoal, required: false })
  @IsOptional()
  @IsEnum(PrimaryGoal)
  primaryGoal: PrimaryGoal;

  @ApiProperty({ enum: BodyShapes, required: false })
  @IsOptional()
  @IsEnum(BodyShapes)
  bodyShape: BodyShapes;

  @ApiProperty({ enum: BodyShapes, required: false })
  @IsOptional()
  @IsEnum(BodyShapes)
  requiredBodyShape: BodyShapes;

  @ApiProperty({ enum: WorkoutPlaces, required: false })
  @IsOptional()
  @IsEnum(WorkoutPlaces)
  workoutPlace: WorkoutPlaces;


  @ApiProperty({ type: [String], enum: MuscleGroups, required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(MuscleGroups, { each: true })
  muscleGroups: MuscleGroups[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  exerciseLevel: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  exerciseFrequency: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  exerciseDuration: number;

  @ApiProperty({ enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  // @ApiProperty({ type: [String], enum: MuscleGroups, required: false })
  // @IsOptional()
  // @IsArray()
  // @IsEnum(MuscleGroups, { each: true })
  // issueMuscleGroups: MuscleGroups[];

  @ApiProperty({ enum: ProfessionGroups, required: false })
  @IsOptional()
  @IsEnum(ProfessionGroups)
  professionGroup: ProfessionGroups;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  height: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  bmi: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  goalWeight: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  age: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
