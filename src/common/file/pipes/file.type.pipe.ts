import {
    PipeTransform,
    Injectable,
    UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ENUM_FILE_STATUS_CODE_ERROR } from 'src/common/file/constants/file.status-code.constant';
import { IFile } from 'src/common/file/interfaces/file.interface';

@Injectable()
export class FileTypePipe<T = any> implements PipeTransform {
    constructor(
        readonly type: T,
        readonly field?: string
    ) {}

    async transform(value: any): Promise<IFile | IFile[]> {
        if (!value) {
            return value;
        }

        let fieldValue = value;
        if (this.field) {
            fieldValue = value[this.field];
        }

        if (
            !fieldValue ||
            Object.keys(fieldValue).length === 0 ||
            (Array.isArray(fieldValue) && fieldValue.length === 0)
        ) {
            return value;
        }

        if (Array.isArray(fieldValue)) {
            for (const val of fieldValue) {
                await this.validate(val.mimetype);
            }

            return value;
        }

        const file: IFile = fieldValue as IFile;
        await this.validate(file.mimetype);

        return value;
    }

    async validate(mimetype: string): Promise<void> {
        if (
            !Object.values(this.type).find(
                (val) => val === mimetype.toLowerCase()
            )
        ) {
            throw new UnsupportedMediaTypeException({
                statusCode: ENUM_FILE_STATUS_CODE_ERROR.FILE_EXTENSION_ERROR,
                message: 'file.error.mimeInvalid',
            });
        }

        return;
    }
}
