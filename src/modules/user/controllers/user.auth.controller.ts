import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    Patch,
    Post,
    UploadedFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    AuthJwtAccessProtected,
    AuthJwtPayload,
    AuthJwtRefreshProtected,
    AuthJwtToken,
} from 'src/common/auth/decorators/auth.jwt.decorator';
import { IAuthPassword } from 'src/common/auth/interfaces/auth.interface';
import { AuthService } from 'src/common/auth/services/auth.service';
import { AwsS3Serialization } from 'src/common/aws/serializations/aws.s3.serialization';
import { AwsS3Service } from 'src/common/aws/services/aws.s3.service';
import { ENUM_ERROR_STATUS_CODE_ERROR } from 'src/common/error/constants/error.status-code.constant';
import { UploadFileSingle } from 'src/common/file/decorators/file.decorator';
import { IFile } from 'src/common/file/interfaces/file.interface';
import { FileRequiredPipe } from 'src/common/file/pipes/file.required.pipe';
import { FileSizeImagePipe } from 'src/common/file/pipes/file.size.pipe';
import { FileTypeImagePipe } from 'src/common/file/pipes/file.type.pipe';
import { Response } from 'src/common/response/decorators/response.decorator';
import { IResponse } from 'src/common/response/interfaces/response.interface';
import { ENUM_ROLE_STATUS_CODE_ERROR } from 'src/common/role/constants/role.status-code.constant';
import { SettingService } from 'src/common/setting/services/setting.service';
import { ENUM_USER_STATUS_CODE_ERROR } from 'src/modules/user/constants/user.status-code.constant';
import { UserAuthProfileGuard } from 'src/modules/user/decorators/user.auth.decorator';
import { GetUser } from 'src/modules/user/decorators/user.decorator';
import {
    UserAuthChangePasswordDoc,
    UserAuthDeleteSelfDoc,
    UserAuthInfoDoc,
    UserAuthProfileDoc,
    UserAuthRefreshDoc,
    UserAuthUploadProfileDoc,
} from 'src/modules/user/docs/user.auth.doc';
import { UserChangePasswordDto } from 'src/modules/user/dtos/user.change-password.dto';
import { IUserDoc } from 'src/modules/user/interfaces/user.interface';
import { UserDoc } from 'src/modules/user/repository/entities/user.entity';
import { UserLoginSerialization } from 'src/modules/user/serializations/user.login.serialization';
import { UserPayloadSerialization } from 'src/modules/user/serializations/user.payload.serialization';
import { UserProfileSerialization } from 'src/modules/user/serializations/user.profile.serialization';
import { UserService } from 'src/modules/user/services/user.service';

@ApiTags('modules.user.auth')
@Controller({
    version: '1',
    path: '/user',
})
export class UserAuthController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly settingService: SettingService,
        private readonly awsS3Service: AwsS3Service
    ) {}

    @UserAuthRefreshDoc()
    @Response('user.refresh', { serialization: UserLoginSerialization })
    @UserAuthProfileGuard()
    @AuthJwtRefreshProtected()
    @HttpCode(HttpStatus.OK)
    @Post('/refresh')
    async refresh(
        @AuthJwtPayload()
        { loginDate }: Record<string, any>,
        @AuthJwtToken() refreshToken: string,
        @GetUser() user: UserDoc
    ): Promise<IResponse> {
        if (user.blocked) {
            throw new ForbiddenException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_BLOCKED_ERROR,
                message: 'user.error.blocked',
            });
        } else if (user.inactivePermanent) {
            throw new ForbiddenException({
                statusCode:
                    ENUM_USER_STATUS_CODE_ERROR.USER_INACTIVE_PERMANENT_ERROR,
                message: 'user.error.inactivePermanent',
            });
        } else if (!user.isActive) {
            throw new ForbiddenException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_INACTIVE_ERROR,
                message: 'user.error.inactive',
            });
        }

        const userWithRole: IUserDoc = await this.userService.joinWithRole(
            user
        );
        if (!userWithRole.role.isActive) {
            throw new ForbiddenException({
                statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_INACTIVE_ERROR,
                message: 'role.error.inactive',
            });
        }

        const checkPasswordExpired: boolean =
            await this.authService.checkPasswordExpired(user.passwordExpired);

        if (checkPasswordExpired) {
            throw new ForbiddenException({
                statusCode:
                    ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_EXPIRED_ERROR,
                message: 'user.error.passwordExpired',
            });
        }

        const payload: UserPayloadSerialization =
            await this.userService.payloadSerialization(userWithRole);
        const tokenType: string = await this.authService.getTokenType();
        const expiresIn: number =
            await this.authService.getAccessTokenExpirationTime();
        const payloadAccessToken: Record<string, any> =
            await this.authService.createPayloadAccessToken(payload, {
                loginDate,
            });

        const payloadEncryption = await this.authService.getPayloadEncryption();
        let payloadHashedAccessToken: Record<string, any> | string =
            payloadAccessToken;

        if (payloadEncryption) {
            payloadHashedAccessToken =
                await this.authService.encryptAccessToken(payloadAccessToken);
        }

        const accessToken: string = await this.authService.createAccessToken(
            payloadHashedAccessToken
        );

        return {
            data: {
                tokenType,
                expiresIn,
                accessToken,
                refreshToken,
            },
        };
    }

    @UserAuthChangePasswordDoc()
    @Response('user.changePassword')
    @UserAuthProfileGuard()
    @AuthJwtAccessProtected()
    @Patch('/change-password')
    async changePassword(
        @Body() body: UserChangePasswordDto,
        @GetUser() user: UserDoc
    ): Promise<void> {
        const passwordAttempt: boolean =
            await this.settingService.getPasswordAttempt();
        const maxPasswordAttempt: number =
            await this.settingService.getMaxPasswordAttempt();
        if (passwordAttempt && user.passwordAttempt >= maxPasswordAttempt) {
            throw new ForbiddenException({
                statusCode:
                    ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_ATTEMPT_MAX_ERROR,
                message: 'user.error.passwordAttemptMax',
            });
        }

        const matchPassword: boolean = await this.authService.validateUser(
            body.oldPassword,
            user.password
        );
        if (!matchPassword) {
            try {
                await this.userService.increasePasswordAttempt(user);
            } catch (err: any) {
                throw new InternalServerErrorException({
                    statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                    message: 'http.serverError.internalServerError',
                    _error: err.message,
                });
            }

            throw new BadRequestException({
                statusCode:
                    ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_NOT_MATCH_ERROR,
                message: 'user.error.passwordNotMatch',
            });
        }

        const newMatchPassword: boolean = await this.authService.validateUser(
            body.newPassword,
            user.password
        );
        if (newMatchPassword) {
            throw new BadRequestException({
                statusCode:
                    ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_NEW_MUST_DIFFERENCE_ERROR,
                message: 'user.error.newPasswordMustDifference',
            });
        }

        try {
            await this.userService.resetPasswordAttempt(user);
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }

        try {
            const password: IAuthPassword =
                await this.authService.createPassword(body.newPassword);

            await this.userService.updatePassword(user, password);
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }

        return;
    }

    @UserAuthInfoDoc()
    @Response('user.info', { serialization: UserPayloadSerialization })
    @AuthJwtAccessProtected()
    @Get('/info')
    async info(
        @AuthJwtPayload() payload: UserPayloadSerialization
    ): Promise<IResponse> {
        return { data: payload };
    }

    @UserAuthProfileDoc()
    @Response('user.profile', {
        serialization: UserProfileSerialization,
    })
    @UserAuthProfileGuard()
    @AuthJwtAccessProtected()
    @Get('/profile')
    async profile(@GetUser() user: UserDoc): Promise<IResponse> {
        const userWithRole: IUserDoc = await this.userService.joinWithRole(
            user
        );
        return { data: userWithRole.toObject() };
    }

    @UserAuthUploadProfileDoc()
    @Response('user.upload')
    @UserAuthProfileGuard()
    @AuthJwtAccessProtected()
    @UploadFileSingle('file')
    @HttpCode(HttpStatus.OK)
    @Post('/profile/upload')
    async upload(
        @GetUser() user: UserDoc,
        @UploadedFile(FileRequiredPipe, FileSizeImagePipe, FileTypeImagePipe)
        file: IFile
    ): Promise<void> {
        const filename: string = file.originalname;
        const content: Buffer = file.buffer;
        const mime: string = filename
            .substring(filename.lastIndexOf('.') + 1, filename.length)
            .toUpperCase();

        const path = await this.userService.createPhotoFilename();

        try {
            const aws: AwsS3Serialization =
                await this.awsS3Service.putItemInBucket(
                    `${path.filename}.${mime}`,
                    content,
                    {
                        path: `${path.path}/${user._id}`,
                    }
                );
            await this.userService.updatePhoto(user, aws);
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }

        return;
    }

    @UserAuthDeleteSelfDoc()
    @Response('user.deleteSelf')
    @UserAuthProfileGuard()
    @AuthJwtAccessProtected()
    @Delete('/delete')
    async deleteSelf(@GetUser() user: UserDoc): Promise<void> {
        try {
            await this.userService.inactivePermanent(user);
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }

        return;
    }
}