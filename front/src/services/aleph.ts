import { AuthenticatedAlephHttpClient } from "@aleph-sdk/client";
import { ETHAccount, getAccountFromProvider, importAccountFromPrivateKey } from "@aleph-sdk/ethereum";
import { PrivateKey } from "eciesjs";
import { SignMessageReturnType } from "viem";
import web3 from "web3";
import { z } from "zod";

import env from "@/config/env";

// Aleph keys and channels settings
const SECURITY_AGGREGATE_KEY = "security";
const BEDROCK_GENERAL_CHANNEL = "bedrock";

export class AlephService {
	constructor(
		/* eslint-disable-next-line no-unused-vars */
		private account: ETHAccount,
		/* eslint-disable-next-line no-unused-vars */
		private subAccountClient: AuthenticatedAlephHttpClient,
		// eslint-disable-next-line no-unused-vars
		private encryptionPrivateKey: PrivateKey,
	) {}

	static async initialize(hash: SignMessageReturnType) {
		const privateKey = web3.utils.sha3(hash);

		if (privateKey === undefined) {
			console.error("Private key generation failed");
			return undefined;
		}
		const encryptionPrivateKey = PrivateKey.fromHex(privateKey);

		const subAccount = importAccountFromPrivateKey(privateKey);
		const account = await getAccountFromProvider(window.ethereum);
		const accountClient = new AuthenticatedAlephHttpClient(account, env.ALEPH_API_URL);
		const subAccountClient = new AuthenticatedAlephHttpClient(subAccount, env.ALEPH_API_URL);

		await AlephService.getSecurityPermission(account, subAccount, accountClient);

		return new AlephService(account, subAccountClient, encryptionPrivateKey);
	}

	static async getSecurityPermission(
		account: ETHAccount,
		subAccount: ETHAccount,
		accountClient: AuthenticatedAlephHttpClient,
	) {
		try {
			const alephPermissionsSchema = z.object({
				authorizations: z.array(
					z.object({
						address: z.string(),
						chain: z.string().optional(),
						channels: z.array(z.string()).optional(),
						types: z.array(z.string()).optional(),
						post_types: z.array(z.string()).optional(),
						aggregate_keys: z.array(z.string()).optional(),
					}),
				),
			});

			const securitySettings = alephPermissionsSchema.parse(
				await accountClient.fetchAggregate(account.address, SECURITY_AGGREGATE_KEY),
			);

			if (
				!securitySettings.authorizations.find(
					(authorization) =>
						authorization.address === subAccount.address &&
						authorization.types === undefined &&
						authorization.channels?.includes(BEDROCK_GENERAL_CHANNEL),
				)
			) {
				const oldAuthorizations = securitySettings.authorizations.filter((a) => a.address !== subAccount.address);

				await accountClient.createAggregate({
					key: SECURITY_AGGREGATE_KEY,
					content: {
						authorizations: [
							...oldAuthorizations,
							{
								address: subAccount.address,
								channels: [BEDROCK_GENERAL_CHANNEL],
							},
						],
					},
				});
			}
		} catch (error) {
			// Security aggregate does not exist or with invalid content, creating a new one
			await accountClient.createAggregate({
				key: SECURITY_AGGREGATE_KEY,
				content: {
					authorizations: [
						{
							address: subAccount.address,
							channels: [BEDROCK_GENERAL_CHANNEL],
						},
					],
				},
			});
		}
	}
}
