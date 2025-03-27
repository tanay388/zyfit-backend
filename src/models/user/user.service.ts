import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  BodyShapes,
  PrimaryGoal,
  ProfessionGroups,
  User,
  WorkoutLevel,
} from './entities/user.entity';
import { FirebaseUser } from '../../providers/firebase/firebase.service';
import { UploaderService } from '../../providers/uploader/uploader.service';
import { NotificationService } from 'src/providers/notification/notification.service';

@Injectable()
export class UserService {
  constructor(
    // private analyticsService: AnalyticsService,
    private uploader: UploaderService,
    private notificationService: NotificationService,
  ) {}

  updateToken(uid: string, token: string) {
    return this.notificationService.updateToken(uid, token);
  }

  async getProfile(fUser: FirebaseUser, token?: string) {
    const user = await User.findOne({
      where: { id: fUser.uid },
    });

    if (!user) return this.createUserProfile(fUser);

    if (token) this.updateToken(fUser.uid, token);

    // this.analyticsService.addAnalytics(user, AnalyticsType.login);

    return user;
  }

  async getProfileById(uid: string) {
    const user = await User.findOne({
      where: { id: uid },
      relations: ['owen', 'worksIn'],
    });
    return user;
  }

  async createUserProfile(fUser: FirebaseUser) {
    const { uid, email, phone_number, picture } = fUser;
    await User.save({
      id: uid,
      email,
      phone: phone_number,
      photo: picture,
    });

    return this.getProfile(fUser);
  }

  async updateProfile(
    fUser: FirebaseUser,
    updateUserDto: UpdateUserDto,
    photo?: Express.Multer.File,
  ) {
    const { uid, email } = fUser;

    let path: string;
    if (photo) {
      path = await this.uploader.uploadFile(photo, 'users/' + uid);
    }

    await User.update(uid, {
      photo: path,
      name: updateUserDto.name,
      gender: updateUserDto.gender,
      email: updateUserDto.email,
      phone: updateUserDto.phone,
      ageGroup: updateUserDto.ageGroup,
      primaryGoal: updateUserDto.primaryGoal,
      bodyShape: updateUserDto.bodyShape,
      requiredBodyShape: updateUserDto.requiredBodyShape,
      workoutPlace: updateUserDto.workoutPlace,
      muscleGroups: updateUserDto.muscleGroups,
      exerciseLevel: updateUserDto.exerciseLevel,
      exerciseFrequency: updateUserDto.exerciseFrequency,
      exerciseDuration: updateUserDto.exerciseDuration,
      professionGroup: updateUserDto.professionGroup,
      height: updateUserDto.height,
      weight: updateUserDto.weight,
      bmi: updateUserDto.bmi,
      goalWeight: updateUserDto.goalWeight,
      // issueMuscleGroups: updateUserDto.issueMuscleGroups,
      age: updateUserDto.age,
    });

    return this.getProfile(fUser);
  }

  async deleteProfile(uid: string) {
    await User.getRepository().softRemove({ id: uid });
  }

  async updateFirebaseToken(
    user: FirebaseUser,
    token: string,
    isShop?: boolean,
  ) {
    await this.notificationService.updateToken(user.uid, token, isShop);
    return { done: true };
  }

  getWorkoutLevel(user: User): WorkoutLevel {
    // Calculate BMI
    const heightInMeters = user.height / 100; // Convert height from cm to meters
    const bmi = user.weight / (heightInMeters * heightInMeters);

    // Determine BMI factor
    let bmiFactor: number;
    if (bmi < 18.5) {
      bmiFactor = 0.3; // Underweight
    } else if (bmi >= 18.5 && bmi < 24.9) {
      bmiFactor = 0.5; // Normal weight
    } else if (bmi >= 25 && bmi < 29.9) {
      bmiFactor = 0.7; // Overweight
    } else {
      bmiFactor = 1; // Obese
    }

    // Factor 2: Body Shape
    const bodyShapeFactor =
      user.bodyShape === BodyShapes.heavy || user.bodyShape === BodyShapes.slim
        ? 0
        : 1;
    // Factor 3: Exercise Level
    const exerciseLevelFactor =
      user.exerciseLevel === WorkoutLevel.beginner
        ? 0
        : user.exerciseLevel === WorkoutLevel.intermediate
          ? 1
          : 2;
    // Factor 4: Primary Goal
    const primaryGoalFactor =
      user.primaryGoal === PrimaryGoal.loose_weight ? 0 : 1;
    // Factor 5: Age
    const ageFactor = user.age && user.age < 40 ? 1 : 0;
    // Factor 6: Profession Group
    const professionFactor =
      user.professionGroup === ProfessionGroups.athletic ? 1 : 0;

    // Calculate a score based on the factors
    const score =
      bmiFactor * 0.3 +
      bodyShapeFactor * 0.2 +
      exerciseLevelFactor * 0.2 +
      primaryGoalFactor * 0.1 +
      ageFactor * 0.1 +
      professionFactor * 0.1;

    // Determine workout level based on the score
    if (score < 1) {
      return WorkoutLevel.beginner;
    } else if (score >= 1 && score < 2) {
      return WorkoutLevel.intermediate;
    } else {
      return WorkoutLevel.advanced;
    }
  }
}
