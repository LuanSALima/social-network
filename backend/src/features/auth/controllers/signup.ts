import { Request, Response } from 'express';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { signupSchema } from '@auth/schemes/signup';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { ObjectId } from 'mongodb';
import { Helpers } from '@global/helpers/helpers';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@global/helpers/cloudinary-upload';
import HTTP_STATUS from 'http-status-codes';

export class Signup {
  @joiValidation(signupSchema)
  public async create(request: Request, response: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = request.body;
    const checkIfuserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
    if (checkIfuserExist) {
      throw new BadRequestError('Invalid credentials');
    }

    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const authData: IAuthDocument = Signup.prototype.signupData({
      _id: authObjectId,
      uId,
      avatarColor,
      email,
      password,
      username
    });
    const avatarImageUploadResult: UploadApiResponse = await uploads(avatarImage, `${userObjectId}`, true, true) as UploadApiResponse;
    if (!avatarImageUploadResult?.public_id) {
      throw new BadRequestError('File upload: Error occured. Try again.');
    }

    response.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully', authData });
  }

  private signupData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, avatarColor, password, uId } = data;
    return {
      _id,
      username: Helpers.firstLetterUppercase(username),
      email: email.toLowerCase(),
      avatarColor,
      password,
      uId,
      createdAt: new Date()
    } as IAuthDocument;
  }
}
