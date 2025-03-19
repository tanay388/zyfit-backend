import { PartialType } from '@nestjs/mapped-types';
import { SignUpUserDto } from './signup-user.dto';
import { ApiProperty } from '@nestjs/swagger';
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

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name: string;

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

  @ApiProperty({ enum: WorkoutPlaces, required: false })
  @IsOptional()
  @IsEnum(WorkoutPlaces)
  workOutPlace: WorkoutPlaces;

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
  exerciseFrequency: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  exerciseDuration: number;

  @ApiProperty({ enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ type: [String], enum: MuscleGroups, required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(MuscleGroups, { each: true })
  issueMuscleGroups: MuscleGroups[];

  @ApiProperty({ enum: ProfessionGroups, required: false })
  @IsOptional()
  @IsEnum(ProfessionGroups)
  professionGroup: ProfessionGroups;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  height: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  weight: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  bmi: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  goalWeight: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  age: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
