import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { ENUM_PAGINATION_TYPE } from '../pagination/constants/pagination.constant';
import {
    RESPONSE_CUSTOM_TIMEOUT_META_KEY,
    RESPONSE_CUSTOM_TIMEOUT_META_VALUE_KEY,
    RESPONSE_MESSAGE_PATH_META_KEY,
    RESPONSE_PAGING_OPTIONS_META_KEY,
} from './constants/response.constant';
import { ResponseDefaultInterceptor } from './interceptors/response.default.interceptor';
import { ResponsePagingInterceptor } from './interceptors/response.paging.interceptor';
import { IResponsePagingOptions } from './response.interface';

export function Response(messagePath: string): any {
    return applyDecorators(
        UseInterceptors(ResponseDefaultInterceptor),
        SetMetadata(RESPONSE_MESSAGE_PATH_META_KEY, messagePath)
    );
}

export function ResponsePaging(
    messagePath: string,
    options?: IResponsePagingOptions
): any {
    return applyDecorators(
        UseInterceptors(ResponsePagingInterceptor),
        SetMetadata(RESPONSE_MESSAGE_PATH_META_KEY, messagePath),
        SetMetadata(
            RESPONSE_PAGING_OPTIONS_META_KEY,
            options ? options : { type: ENUM_PAGINATION_TYPE.FULL }
        )
    );
}

export function ResponseTimeout(seconds: string): any {
    return applyDecorators(
        SetMetadata(RESPONSE_CUSTOM_TIMEOUT_META_KEY, true),
        SetMetadata(RESPONSE_CUSTOM_TIMEOUT_META_VALUE_KEY, seconds)
    );
}
