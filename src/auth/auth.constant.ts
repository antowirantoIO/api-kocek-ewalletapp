export enum ENUM_AUTH_STATUS_CODE_ERROR {
    AUTH_GUARD_BASIC_TOKEN_NEEDED_ERROR = 5100,
    AUTH_GUARD_BASIC_TOKEN_INVALID_ERROR = 5101,
    AUTH_GUARD_JWT_ACCESS_TOKEN_ERROR = 5102,
    AUTH_GUARD_JWT_REFRESH_TOKEN_ERROR = 5103,
    AUTH_GUARD_INACTIVE_ERROR = 5104,
    AUTH_GUARD_ROLE_INACTIVE_ERROR = 5105,
    AUTH_GUARD_ADMIN_ERROR = 5106,
    AUTH_GUARD_PASSWORD_EXPIRED_ERROR = 5107,
    AUTH_PASSWORD_NOT_MATCH_ERROR = 5108,
    AUTH_PASSWORD_NEW_MUST_DIFFERENCE_ERROR = 5109,
    AUTH_PASSWORD_EXPIRED_ERROR = 5110,
}

export enum ENUM_AUTH_STATUS_CODE_SUCCESS {
    AUTH_LOGIN_SUCCESS = 1001,
}

export const AUTH_ADMIN_META_KEY = 'AuthAdminMetaKey';
