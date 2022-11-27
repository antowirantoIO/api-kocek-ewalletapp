import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AUTH_PERMISSION_META_KEY } from 'src/common/auth/constants/auth.constant';
import { ENUM_AUTH_PERMISSIONS } from 'src/common/auth/constants/auth.enum.permission.constant';
import { AuthPayloadPermissionGuard } from 'src/common/auth/guards/payload/auth.payload.permission.guard';
import { AuthPermissionGuard } from 'src/common/auth/guards/permission/auth.permission.guard';

export function AuthPermissionProtected(
    ...permissions: ENUM_AUTH_PERMISSIONS[]
): MethodDecorator {
    return applyDecorators(
        UseGuards(AuthPermissionGuard, AuthPayloadPermissionGuard),
        SetMetadata(AUTH_PERMISSION_META_KEY, permissions)
    );
}
