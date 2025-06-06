// This file is auto-generated by @hey-api/openapi-ts

import { type Options as ClientOptions, type TDataShape, type Client, formDataBodySerializer } from '@hey-api/client-axios';
import type { RegisterUsernameRegisterPostData, RegisterUsernameRegisterPostResponse, RegisterUsernameRegisterPostError, CheckUsernameAvailableAvailableGetData, CheckUsernameAvailableAvailableGetResponse, CheckUsernameAvailableAvailableGetError, GetUsernameAddressGetData, GetUsernameAddressGetResponse, GetUsernameAddressGetError, GetAvatarUsernameUsernameAvatarGetData, GetAvatarUsernameUsernameAvatarGetResponse, GetAvatarUsernameUsernameAvatarGetError, ChangeAvatarUsernameUsernameAvatarPostData, ChangeAvatarUsernameUsernameAvatarPostResponse, ChangeAvatarUsernameUsernameAvatarPostError } from './types.gen';
import { client as _heyApiClient } from './client.gen';

export type Options<TData extends TDataShape = TDataShape, ThrowOnError extends boolean = boolean> = ClientOptions<TData, ThrowOnError> & {
    /**
     * You can provide a client instance returned by `createClient()` instead of
     * individual options. This might be also useful if you want to implement a
     * custom client.
     */
    client?: Client;
    /**
     * You can pass arbitrary values through the `meta` object. This can be
     * used to access values that aren't defined as part of the SDK function.
     */
    meta?: Record<string, unknown>;
};

/**
 * Register Username
 * Register an ENS subname
 */
export const registerUsernameRegisterPost = <ThrowOnError extends boolean = false>(options: Options<RegisterUsernameRegisterPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<RegisterUsernameRegisterPostResponse, RegisterUsernameRegisterPostError, ThrowOnError>({
        url: '/register',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Check Username Available
 * Check if an ENS subname is available
 */
export const checkUsernameAvailableAvailableGet = <ThrowOnError extends boolean = false>(options: Options<CheckUsernameAvailableAvailableGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<CheckUsernameAvailableAvailableGetResponse, CheckUsernameAvailableAvailableGetError, ThrowOnError>({
        url: '/available',
        ...options
    });
};

/**
 * Get Username
 * Get the ENS subname of an address
 */
export const getUsernameAddressGet = <ThrowOnError extends boolean = false>(options: Options<GetUsernameAddressGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetUsernameAddressGetResponse, GetUsernameAddressGetError, ThrowOnError>({
        url: '/{address}',
        ...options
    });
};

/**
 * Get Avatar
 * Get the avatar URL of a username
 */
export const getAvatarUsernameUsernameAvatarGet = <ThrowOnError extends boolean = false>(options: Options<GetAvatarUsernameUsernameAvatarGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetAvatarUsernameUsernameAvatarGetResponse, GetAvatarUsernameUsernameAvatarGetError, ThrowOnError>({
        url: '/username/{username}/avatar',
        ...options
    });
};

/**
 * Change Avatar
 * Create or update the avatar of a user (using ENS text records)
 */
export const changeAvatarUsernameUsernameAvatarPost = <ThrowOnError extends boolean = false>(options: Options<ChangeAvatarUsernameUsernameAvatarPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<ChangeAvatarUsernameUsernameAvatarPostResponse, ChangeAvatarUsernameUsernameAvatarPostError, ThrowOnError>({
        ...formDataBodySerializer,
        url: '/username/{username}/avatar',
        ...options,
        headers: {
            'Content-Type': null,
            ...options?.headers
        }
    });
};