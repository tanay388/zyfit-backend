import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
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
    { name, gender, birthDate, phone }: UpdateUserDto,
    photo?: Express.Multer.File,
  ) {
    const { uid, email } = fUser;

    let path: string;
    if (photo) {
      path = await this.uploader.uploadFile(photo, 'users/' + uid);
    }

    await User.update(uid, {
      photo: path,
      name,
      gender,
      birthDate,
      email,
      phone,
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
}
