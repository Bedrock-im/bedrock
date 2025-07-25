// This file is auto-generated by @hey-api/openapi-ts

import { type Options as ClientOptions, type TDataShape, type Client, formDataBodySerializer } from '@hey-api/client-axios';
import type { ThirdwebWebhookRouteThirdwebWebhookPostData, ThirdwebWebhookRouteThirdwebWebhookPostResponse, ThirdwebWebhookRouteThirdwebWebhookPostError, GetCreditsRouteCreditsAddressGetData, GetCreditsRouteCreditsAddressGetResponse, GetCreditsRouteCreditsAddressGetError, AddCreditsRouteCreditsAddPostData, AddCreditsRouteCreditsAddPostResponse, AddCreditsRouteCreditsAddPostError, RegisterUsernameRegisterPostData, RegisterUsernameRegisterPostResponse, RegisterUsernameRegisterPostError, CheckUsernameAvailableAvailableGetData, CheckUsernameAvailableAvailableGetResponse, CheckUsernameAvailableAvailableGetError, GetUsernameAddressGetData, GetUsernameAddressGetResponse, GetUsernameAddressGetError, GetAddressUsernameUsernameAddressGetData, GetAddressUsernameUsernameAddressGetResponse, GetAddressUsernameUsernameAddressGetError, GetAvatarUsernameUsernameAvatarGetData, GetAvatarUsernameUsernameAvatarGetResponse, GetAvatarUsernameUsernameAvatarGetError, ChangeAvatarUsernameUsernameAvatarPostData, ChangeAvatarUsernameUsernameAvatarPostResponse, ChangeAvatarUsernameUsernameAvatarPostError } from './types.gen';
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
 * Thirdweb Webhook Route
 * Receive webhooks from Thirdweb
 */
export const thirdwebWebhookRouteThirdwebWebhookPost = <ThrowOnError extends boolean = false>(options: Options<ThirdwebWebhookRouteThirdwebWebhookPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<ThirdwebWebhookRouteThirdwebWebhookPostResponse, ThirdwebWebhookRouteThirdwebWebhookPostError, ThrowOnError>({
        url: '/thirdweb/webhook',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Get Credits Route
 * Get credit balance for an address
 */
export const getCreditsRouteCreditsAddressGet = <ThrowOnError extends boolean = false>(options: Options<GetCreditsRouteCreditsAddressGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetCreditsRouteCreditsAddressGetResponse, GetCreditsRouteCreditsAddressGetError, ThrowOnError>({
        url: '/credits/{address}',
        ...options
    });
};

/**
 * Add Credits Route
 * Add credits directly to an address balance
 */
export const addCreditsRouteCreditsAddPost = <ThrowOnError extends boolean = false>(options: Options<AddCreditsRouteCreditsAddPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<AddCreditsRouteCreditsAddPostResponse, AddCreditsRouteCreditsAddPostError, ThrowOnError>({
        url: '/credits/add',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
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
 * Get Address
 * Get the address of a username using the registry contract
 */
export const getAddressUsernameUsernameAddressGet = <ThrowOnError extends boolean = false>(options: Options<GetAddressUsernameUsernameAddressGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetAddressUsernameUsernameAddressGetResponse, GetAddressUsernameUsernameAddressGetError, ThrowOnError>({
        url: '/username/{username}/address',
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