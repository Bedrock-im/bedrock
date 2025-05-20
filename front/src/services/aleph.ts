import { AuthenticatedAlephHttpClient } from "@aleph-sdk/client";
import { ETHAccount, getAccountFromProvider, importAccountFromPrivateKey } from "@aleph-sdk/ethereum";
import { AggregateMessage, ForgetMessage, ItemType, PostMessage, StoreMessage } from "@aleph-sdk/message";
import { PrivateKey } from "eciesjs";
import { SignMessageReturnType } from "viem";
import web3 from "web3";
import { z } from "zod";

import env from "@/config/env";

// Aleph keys and channels settings
const SECURITY_AGGREGATE_KEY = "security"; // Reserved Aleph key (https://docs.aleph.im/protocol/permissions/#the-security-aggregate)
export const BEDROCK_MESSAGE = "Bedrock.im"; // /!\ Fixed message, don't change it or every user will lose his data /!\
const ALEPH_GENERAL_CHANNEL = env.ALEPH_GENERAL_CHANNEL;

export class AlephService {
	constructor(
		private account: ETHAccount,
		private subAccountClient: AuthenticatedAlephHttpClient,
		public encryptionPrivateKey: PrivateKey,
	) {}

	static async initialize(hash: SignMessageReturnType) {
		const privateKey = web3.utils.sha3(hash);

		if (privateKey === undefined) {
			console.error("Private key generation failed");
			return undefined;
		}
		const encryptionPrivateKey = PrivateKey.fromHex(privateKey);

		const subAccount = importAccountFromPrivateKey(privateKey);
		// @ts-expect-error undefined window.ethereum
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
						authorization.channels?.includes(ALEPH_GENERAL_CHANNEL),
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
								channels: [ALEPH_GENERAL_CHANNEL],
							},
						],
					},
				});
			}
		} catch (_error) {
			// Security aggregate does not exist or with invalid content, creating a new one
			await accountClient.createAggregate({
				key: SECURITY_AGGREGATE_KEY,
				content: {
					authorizations: [
						{
							address: subAccount.address,
							channels: [ALEPH_GENERAL_CHANNEL],
						},
					],
				},
			});
		}
	}

	async uploadFile(file: File | Buffer): Promise<StoreMessage> {
		return await this.subAccountClient.createStore({
			fileObject: file,
			storageEngine: ItemType.ipfs,
			channel: ALEPH_GENERAL_CHANNEL,
		});
	}

	async downloadFile(storeHash: string): Promise<ArrayBuffer> {
		const ipfsHash = await this.subAccountClient.getMessage(storeHash);
		const ContentSchema = z.object({
			address: z.string(),
			item_type: z.string(),
			item_hash: z.string(),
			time: z.number(),
		});
		const { success, data } = ContentSchema.safeParse(ipfsHash.content);
		if (!success) throw new Error(`Invalid data from Aleph: ${data}`);
		return this.subAccountClient.downloadFile(data.item_hash);
	}

	async deleteFiles(itemHashes: string[]): Promise<ForgetMessage> {
		return this.subAccountClient.forget({ hashes: itemHashes });
	}

	async createAggregate<T extends Record<string, unknown>>(key: string, content: T): Promise<AggregateMessage<T>> {
		return this.subAccountClient.createAggregate({
			key,
			content,
			channel: ALEPH_GENERAL_CHANNEL,
			address: this.account.address,
		});
	}

	async fetchAggregate<T extends z.ZodTypeAny>(key: string, schema: T, owner: string = this.account.address) {
		const unparsedData = await this.subAccountClient.fetchAggregate(owner, key);
		const { success, data, error } = schema.safeParse(unparsedData);
		if (!success)
			throw new Error(`Invalid data from Aleph: ${error.message}, data was ${JSON.stringify(unparsedData)}`);
		return data as z.infer<T>;
	}

	async updateAggregate<S extends z.ZodTypeAny, T extends z.infer<S>>(
		key: string,
		schema: S,
		update_content: (content: T) => Promise<T>,
	): Promise<AggregateMessage<T>> {
		const currentContent = await this.fetchAggregate(key, schema);
		const newContent = await update_content(currentContent);

		return await this.createAggregate(key, newContent);
	}

	async createPost<T extends Record<string, unknown>>(type: string, content: T): Promise<PostMessage<T>> {
		return this.subAccountClient.createPost({
			postType: type,
			content,
			channel: ALEPH_GENERAL_CHANNEL,
			address: this.account.address,
		});
	}

	async fetchPosts<T extends z.ZodTypeAny>(
		type: string,
		schema: T,
		addresses: string[] = [this.account.address],
		hashes: string[] = [],
	) {
		return z.array(schema).parse(
			(
				await this.subAccountClient.getPosts({
					channels: [ALEPH_GENERAL_CHANNEL],
					types: [type],
					addresses,
					hashes,
				})
			).posts.map((post) => post.content),
		) as z.infer<T>[];
	}

	async fetchPost<T extends z.ZodTypeAny>(
		type: string,
		schema: T,
		addresses: string[] = [this.account.address],
		hash: string,
	) {
		return schema.parse(
			(
				await this.subAccountClient.getPost({
					channels: [ALEPH_GENERAL_CHANNEL],
					types: [type],
					addresses,
					hashes: [hash],
				})
			).content,
		) as z.infer<T>;
	}

	async updatePost<S extends z.ZodTypeAny, T extends z.infer<S>>(
		type: string,
		hash: string,
		addresses: string[] = [this.account.address],
		schema: S,
		update_content: (content: T) => T,
	) {
		const currentContent = await this.fetchPost(type, schema, addresses, hash);
		const content = update_content(currentContent);

		return await this.subAccountClient.createPost({
			ref: hash,
			postType: "amend",
			content,
			channel: ALEPH_GENERAL_CHANNEL,
			address: this.account.address,
		});
	}
}
