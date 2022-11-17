import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';
import { Helpers } from '@global/helpers/helpers';

class AuthService {
  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: Helpers.firstLetterUppercase(username) }, { email: email.toLowerCase() }]
    };
    const user: IAuthDocument | null = await AuthModel.findOne(query).exec();
    return user as IAuthDocument;
  }
}

export const authService: AuthService = new AuthService();
