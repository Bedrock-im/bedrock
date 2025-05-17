import { MessageNotFoundError } from "@aleph-sdk/message";
import { toast } from "sonner";
import { z } from "zod";

import { AlephService } from "@/services/aleph";
import { EncryptionService } from "@/services/encryption";

const zodEncryptedHexString = z
	.string()
	.regex(/^[a-f0-9]+$/, { message: "Invalid data, it should be encrypted and in hex format." });
const zod64CharHexString = z.string().regex(/^[a-f0-9]{64}$/, {
	message: "Invalid hash format. It should be a 64-character hexadecimal string.",
});
const zod32CharHexString = z.string().regex(/^[a-f0-9]{32}$/, {
	message: "Invalid hash format. It should be a 32-character hexadecimal string.",
});
export const FileEntrySchema = z.object({
	path: z.string().regex(/^(\/[A-Za-z0-9-_+.]+)+$/, {
		message: "Invalid URI format. It should start with '/', contain valid path segments and do not end with a '/'.",
	}),
	post_hash: zod64CharHexString,
	shared_with: z.array(z.string()).default([]),
});

export const EncryptedFileEntrySchema = z.object({
	path: zodEncryptedHexString,
	post_hash: zod64CharHexString,
	shared_with: z.array(z.string()).default([]),
});

export const FileMetaSchema = z.object({
	key: zod64CharHexString,
	iv: zod32CharHexString,
	store_hash: zod64CharHexString,
	size: z.number().int().nonnegative().default(42),
	created_at: z.string().datetime(),
	deleted_at: z.string().datetime().nullable(),
	shared_keys: z.record(
		z.string(),
		z.object({
			key: zod64CharHexString,
			iv: zod32CharHexString,
		}),
	),
});

export const EncryptedFileMetaSchema = z.object({
	key: zodEncryptedHexString,
	iv: zodEncryptedHexString,
	store_hash: zodEncryptedHexString,
	size: zodEncryptedHexString,
	created_at: zodEncryptedHexString,
	deleted_at: zodEncryptedHexString,
	shared_keys: z.record(
		z.string(),
		z.object({
			key: zodEncryptedHexString,
			iv: zodEncryptedHexString,
		}),
	),
});

export const FileFullInfosSchema = FileEntrySchema.merge(FileMetaSchema);
export const EncryptedFileFullInfosSchema = EncryptedFileEntrySchema.merge(EncryptedFileMetaSchema);

export const FileEntriesSchema = z.object({
	files: z.array(FileEntrySchema).default([]),
});

export const EncryptedFileEntriesSchema = z.object({
	files: z.array(EncryptedFileEntrySchema).default([]),
});

export const ContactSchema = z.object({
	name: z.string(),
	address: z.string(),
	public_key: z.string(),
});

export const EncryptedContactSchema = z.object({
	name: zodEncryptedHexString,
	address: z.string(),
	public_key: z.string(),
});

export const EncryptedContactsAggregate = z.object({
	contacts: z.array(EncryptedContactSchema),
});

const FILE_ENTRIES_AGGREGATE_KEY = "bedrock_file_entries";
const FILE_POST_TYPE = "bedrock_file";
const CONTACTS_AGGREGATE_KEY = "bedrock_contacts";

export type FileEntry = z.infer<typeof FileEntrySchema>;
export type FileMeta = z.infer<typeof FileMetaSchema>;
export type EncryptedFileEntry = z.infer<typeof EncryptedFileEntrySchema>;
export type EncryptedFileMeta = z.infer<typeof EncryptedFileMetaSchema>;
export type FileFullInfos = z.infer<typeof FileFullInfosSchema>;
export type EncryptedFileEntriesSchema = z.infer<typeof EncryptedFileEntriesSchema>;
export type ContactSchema = z.infer<typeof ContactSchema>;
export type EncryptedContactSchema = z.infer<typeof EncryptedContactSchema>;
export type EncryptedContactsAggregate = z.infer<typeof EncryptedContactsAggregate>;

export default class BedrockService {
	constructor(private alephService: AlephService) {}

	get alephPublicKey(): string {
		return this.alephService.encryptionPrivateKey.publicKey.compressed.toString("hex");
	}

	async setup(): Promise<void> {
		try {
			await this.fetchFileEntries();
		} catch (err) {
			if (err instanceof MessageNotFoundError) {
				// New user with no file entries yet
				const emptyFileEntries: EncryptedFileEntriesSchema = { files: [] };
				await this.alephService.createAggregate(FILE_ENTRIES_AGGREGATE_KEY, emptyFileEntries);
			} else {
				throw err;
			}
		}

		try {
			await this.fetchContacts();
		} catch (err) {
			if (err instanceof MessageNotFoundError) {
				// New user with no contacts yet
				const emptyContacts: EncryptedContactsAggregate = { contacts: [] };
				await this.alephService.createAggregate(CONTACTS_AGGREGATE_KEY, emptyContacts);
			}
		}
	}

	async resetData(): Promise<void> {
		// TODO: also forget the POST, STORE files etc
		const emptyFileEntries: EncryptedFileEntriesSchema = { files: [] };
		await this.alephService.createAggregate(FILE_ENTRIES_AGGREGATE_KEY, emptyFileEntries);

		const emptyContacts: EncryptedContactsAggregate = { contacts: [] };
		await this.alephService.createAggregate(CONTACTS_AGGREGATE_KEY, emptyContacts);
	}

	async uploadFiles(directoryPath: string, ...files: File[]): Promise<Omit<FileFullInfos, "post_hash">[]> {
		const uploadedFiles = await this.fetchFileEntries();
		const results = await Promise.allSettled(
			files
				.map((file) => ({
					file,
					path: `${directoryPath}${file.name}`,
					size: file.size,
					created_at: new Date().toISOString(),
					deleted_at: null,
				}))
				.filter(({ path }) => {
					if (this.fileExists(uploadedFiles, path)) {
						console.error(`File already exists at path: ${path}`);
						toast.error(`File already exists at path: ${path}`);
						return false;
					}
					return true;
				})
				.map(({ file, ...rest }) => ({
					file,
					key: EncryptionService.generateKey(),
					iv: EncryptionService.generateIv(),
					...rest,
				}))
				.map(({ file, key, iv, ...rest }) => ({
					file: EncryptionService.encryptFile(file, key, iv),
					iv,
					key,
					...rest,
				}))
				.map(async ({ file, key, iv, ...rest }) => {
					const { item_hash } = await this.alephService.uploadFile(await file);
					return {
						key: key.toString("hex"),
						iv: iv.toString("hex"),
						store_hash: item_hash,
						...rest,
					} as Omit<FileFullInfos, "post_hash">;
				}),
		);

		if (results.length === 0) return Promise.reject("No files were uploaded");

		return results
			.filter((result): result is PromiseFulfilledResult<Omit<FileFullInfos, "post_hash">> => {
				if (result.status === "rejected") {
					console.error("Failed to upload file", result.reason);
					toast.error("Failed to upload file");
					return false;
				}
				return true;
			})
			.map((result) => result.value);
	}

	// The difference between this method and the uploadFiles method is that this method saves the file hashes on Aleph so that it can be fetched later
	async saveFiles(...fileInfos: Omit<FileFullInfos, "post_hash">[]): Promise<FileEntry[]> {
		fileInfos = z.array(FileFullInfosSchema.omit({ post_hash: true })).parse(fileInfos); // Validate the input because fileEntry can be built without using the parse method

		const fileEntries = (
			await Promise.allSettled(
				fileInfos.map(async ({ path, ...rest }) => ({
					post_hash: await this.postFile(rest),
					path,
				})),
			)
		)
			.filter((result): result is PromiseFulfilledResult<FileEntry> => {
				if (result.status === "rejected") {
					console.error("Failed to save file", result.reason);
					toast.error("Failed to save file");
					return false;
				}
				return true;
			})
			.map((result) => result.value);
		let newFiles: FileEntry[] = [];
		await this.alephService.updateAggregate(
			FILE_ENTRIES_AGGREGATE_KEY,
			EncryptedFileEntriesSchema,
			async ({ files }) => {
				const decryptedFiles = this.decryptFilesPaths(files);
				newFiles = fileEntries.filter(({ path }) => {
					if (this.fileExists(decryptedFiles, path)) {
						console.error(`File already exists at path: ${path}`);
						toast.error(`File already exists at path: ${path}`);
						return false;
					}
					return true;
				});

				return {
					files: [
						...files,
						...newFiles.map(({ post_hash, path, shared_with }) => ({
							post_hash,
							path: EncryptionService.encryptEcies(path, this.alephService.encryptionPrivateKey.publicKey.compressed),
							shared_with,
						})),
					],
				};
			},
		);
		if (newFiles.length === 0) return Promise.reject("No new files were saved");
		return newFiles;
	}

	async fetchFileEntries(): Promise<FileEntry[]> {
		return (await this.alephService.fetchAggregate(FILE_ENTRIES_AGGREGATE_KEY, EncryptedFileEntriesSchema)).files.map(
			({ post_hash, path, shared_with }) => ({
				post_hash,
				path: EncryptionService.decryptEcies(path, this.alephService.encryptionPrivateKey.secret),
				shared_with,
			}),
		);
	}

	async fetchContacts(): Promise<ContactSchema[]> {
		return (await this.alephService.fetchAggregate(CONTACTS_AGGREGATE_KEY, EncryptedContactsAggregate)).contacts.map(
			(contact) => ({
				name: EncryptionService.decryptEcies(contact.name, this.alephService.encryptionPrivateKey.secret),
				public_key: contact.public_key,
				address: contact.address,
			}),
		);
	}

	async fetchFilesMetaFromEntries(...fileEntries: FileEntry[]): Promise<FileFullInfos[]> {
		fileEntries = z.array(FileEntrySchema).parse(fileEntries); // Validate the input because fileEntry can be built without using the parse method

		const results = await Promise.allSettled(
			fileEntries.map(async ({ post_hash, path }) => {
				// eslint-disable-next-line prefer-const
				let { key, iv, shared_keys, ...rest } = await this.alephService.fetchPost(
					FILE_POST_TYPE,
					EncryptedFileMetaSchema,
					undefined,
					post_hash,
				);

				if (this.alephPublicKey in shared_keys) {
					key = shared_keys[this.alephPublicKey].key;
					iv = shared_keys[this.alephPublicKey].iv;
				}

				const decryptedKey = EncryptionService.decryptEcies(key, this.alephService.encryptionPrivateKey.secret);
				const decryptedIV = EncryptionService.decryptEcies(iv, this.alephService.encryptionPrivateKey.secret);
				const bufferKey = Buffer.from(decryptedKey, "hex");
				const bufferIv = Buffer.from(decryptedIV, "hex");

				const decryptedDeletedAt = EncryptionService.decrypt(rest.deleted_at, bufferKey, bufferIv);
				return {
					key: decryptedKey,
					iv: decryptedIV,
					post_hash,
					store_hash: EncryptionService.decrypt(rest.store_hash, bufferKey, bufferIv),
					path,
					size: parseInt(EncryptionService.decrypt(rest.size, bufferKey, bufferIv), 10),
					created_at: EncryptionService.decrypt(rest.created_at, bufferKey, bufferIv),
					deleted_at: decryptedDeletedAt === "null" ? null : decryptedDeletedAt,
				};
			}),
		);

		return results
			.filter((result): result is PromiseFulfilledResult<FileFullInfos> => {
				if (result.status === "rejected") {
					console.error("Failed to fetch file", result.reason);
					toast.error("Failed to fetch file");
					return false;
				}
				return true;
			})
			.map((result) => result.value);
	}

	async resetFiles(): Promise<void> {
		await this.alephService.updateAggregate(FILE_ENTRIES_AGGREGATE_KEY, EncryptedFileEntriesSchema, async () => ({
			files: [],
		}));
	}

	async softDeleteFile(fileInfo: Pick<FileFullInfos, "post_hash">, deletionDatetime: Date): Promise<void> {
		const { post_hash } = FileFullInfosSchema.pick({ post_hash: true }).parse(fileInfo);

		await this.alephService.updatePost(
			FILE_POST_TYPE,
			post_hash,
			undefined,
			EncryptedFileMetaSchema,
			({ deleted_at: _, ...rest }) => {
				const key = Buffer.from(
					EncryptionService.decryptEcies(rest.key, this.alephService.encryptionPrivateKey.secret),
					"hex",
				);
				const iv = Buffer.from(
					EncryptionService.decryptEcies(rest.iv, this.alephService.encryptionPrivateKey.secret),
					"hex",
				);
				return {
					deleted_at: EncryptionService.encrypt(deletionDatetime.toISOString(), key, iv),
					...rest,
				};
			},
		);
	}

	async restoreFile(fileInfo: Pick<FileFullInfos, "post_hash">): Promise<void> {
		const { post_hash } = FileFullInfosSchema.pick({ post_hash: true }).parse(fileInfo);

		await this.alephService.updatePost(
			FILE_POST_TYPE,
			post_hash,
			undefined,
			EncryptedFileMetaSchema,
			({ deleted_at: _, ...rest }) => {
				const key = Buffer.from(
					EncryptionService.decryptEcies(rest.key, this.alephService.encryptionPrivateKey.secret),
					"hex",
				);
				const iv = Buffer.from(
					EncryptionService.decryptEcies(rest.iv, this.alephService.encryptionPrivateKey.secret),
					"hex",
				);
				return {
					deleted_at: EncryptionService.encrypt("null", key, iv),
					...rest,
				};
			},
		);
	}

	async hardDeleteFiles(...fileInfos: Pick<FileFullInfos, "store_hash" | "path">[]): Promise<void> {
		fileInfos = z.array(FileFullInfosSchema.pick({ store_hash: true, path: true })).parse(fileInfos); // Validate the input because fileEntry can be built without using the parse method

		const filePaths = fileInfos.map(({ path }) => path);
		const fileStoreHashes = fileInfos.map(({ store_hash }) => store_hash);
		await this.alephService.updateAggregate(
			FILE_ENTRIES_AGGREGATE_KEY,
			EncryptedFileEntriesSchema,
			async ({ files }) => {
				const decryptedFiles = this.decryptFilesPaths(files);
				const newFiles = decryptedFiles.filter(({ path }) => !filePaths.includes(path));
				return {
					files: newFiles.map(({ post_hash, path, shared_with }) => ({
						post_hash,
						path: EncryptionService.encryptEcies(path, this.alephService.encryptionPrivateKey.publicKey.compressed),
						shared_with,
					})),
				};
			},
		);
		await this.alephService.deleteFiles(fileStoreHashes);
	}

	async moveFile(oldPath: string, newPath: string): Promise<void> {
		await this.alephService.updateAggregate(
			FILE_ENTRIES_AGGREGATE_KEY,
			EncryptedFileEntriesSchema,
			async ({ files }) => {
				const decryptedFiles = this.decryptFilesPaths(files);
				const fileIndex = decryptedFiles.findIndex(({ path }) => path === oldPath);
				if (fileIndex === -1) {
					console.error(`File not found at path: ${oldPath}`);
					toast.error(`File not found at path: ${oldPath}`);
					return { files };
				}
				const newFiles = [...decryptedFiles];
				newFiles[fileIndex] = {
					...newFiles[fileIndex],
					path: newPath,
				};
				return {
					files: newFiles.map(({ post_hash, path, shared_with }) => ({
						post_hash,
						path: EncryptionService.encryptEcies(path, this.alephService.encryptionPrivateKey.publicKey.compressed),
						shared_with,
					})),
				};
			},
		);
	}

	async downloadFileFromStoreHash(storeHash: string, key: string, iv: string): Promise<Buffer> {
		const encryptedBuffer = await this.alephService.downloadFile(storeHash);
		const bufferKey = Buffer.from(key, "hex");
		const bufferIv = Buffer.from(iv, "hex");
		return EncryptionService.decryptFile(encryptedBuffer, bufferKey, bufferIv);
	}

	async createContact(name: string, address: string, public_key: string): Promise<void> {
		await this.alephService.updateAggregate(
			CONTACTS_AGGREGATE_KEY,
			EncryptedContactsAggregate,
			async ({ contacts }) => {
				const existingContact = contacts.find((c) => c.public_key === public_key || c.name === name);
				if (existingContact) {
					throw new Error("Contacts must have unique name and public key");
				}
				return {
					contacts: [
						...contacts,
						{
							name: EncryptionService.encryptEcies(name, this.alephService.encryptionPrivateKey.publicKey.compressed),
							public_key,
							address,
						},
					],
				};
			},
		);
	}

	async deleteContact(contactPubKey: string): Promise<void> {
		await this.alephService.updateAggregate(
			CONTACTS_AGGREGATE_KEY,
			EncryptedContactsAggregate,
			async ({ contacts }) => {
				const newContacts = contacts.filter((contact) => contact.public_key !== contactPubKey);
				if (newContacts.length === contacts.length) {
					throw new Error(`Contact not found with public key: ${contactPubKey}`);
				}
				return {
					contacts: newContacts,
				};
			},
		);
	}

	async shareFileWithContact(
		fileInfo: Pick<FileFullInfos, "post_hash" | "path">,
		contactPubKey: string,
	): Promise<void> {
		const { post_hash, path } = FileFullInfosSchema.pick({ post_hash: true, path: true }).parse(fileInfo);

		await this.alephService.updateAggregate(
			FILE_ENTRIES_AGGREGATE_KEY,
			EncryptedFileEntriesSchema,
			async ({ files }) => {
				const decryptedFiles = this.decryptFilesPaths(files);
				const fileIndex = decryptedFiles.findIndex(({ path: filePath }) => filePath === path);
				if (fileIndex === -1) {
					console.error(`File not found at path: ${path}`);
					toast.error(`File not found at path: ${path}`);
					return { files };
				}
				const newFiles = [...decryptedFiles];
				const sharedWith = newFiles[fileIndex].shared_with;
				if (sharedWith.includes(contactPubKey)) {
					console.error(`File already shared with contact: ${contactPubKey}`);
					toast.error(`File already shared with contact: ${contactPubKey}`);
					return { files };
				}

				newFiles[fileIndex] = {
					...newFiles[fileIndex],
					shared_with: [...sharedWith, contactPubKey],
				};

				await this.alephService.updatePost(
					FILE_POST_TYPE,
					post_hash,
					undefined,
					EncryptedFileMetaSchema,
					({ shared_keys, ...rest }) => {
						const key = EncryptionService.decryptEcies(rest.key, this.alephService.encryptionPrivateKey.secret);
						const iv = EncryptionService.decryptEcies(rest.iv, this.alephService.encryptionPrivateKey.secret);

						shared_keys[contactPubKey] = {
							key: EncryptionService.encryptEcies(key, Buffer.from(contactPubKey, "hex")),
							iv: EncryptionService.encryptEcies(iv, Buffer.from(contactPubKey, "hex")),
						};

						return {
							shared_keys,
							...rest,
						};
					},
				);

				return {
					files: newFiles.map(({ post_hash, path, shared_with }) => ({
						post_hash,
						path: EncryptionService.encryptEcies(path, this.alephService.encryptionPrivateKey.publicKey.compressed),
						shared_with,
					})),
				};
			},
		);
	}

	async unshareFileWithContact(
		fileInfo: Pick<FileFullInfos, "post_hash" | "path">,
		contactPubKey: string,
	): Promise<void> {
		const { post_hash, path } = FileFullInfosSchema.pick({ post_hash: true, path: true }).parse(fileInfo);

		await this.alephService.updateAggregate(
			FILE_ENTRIES_AGGREGATE_KEY,
			EncryptedFileEntriesSchema,
			async ({ files }) => {
				const decryptedFiles = this.decryptFilesPaths(files);
				const fileIndex = decryptedFiles.findIndex(({ path: filePath }) => filePath === path);
				if (fileIndex === -1) {
					console.error(`File not found at path: ${path}`);
					toast.error(`File not found at path: ${path}`);
					return { files };
				}
				const newFiles = [...decryptedFiles];
				const sharedWith = newFiles[fileIndex].shared_with;
				if (!sharedWith.includes(contactPubKey)) {
					console.error(`File not shared with contact: ${contactPubKey}`);
					toast.error(`File not shared with contact: ${contactPubKey}`);
					return { files };
				}

				newFiles[fileIndex] = {
					...newFiles[fileIndex],
					shared_with: [...sharedWith.filter((key) => key !== contactPubKey)],
				};

				await this.alephService.updatePost(
					FILE_POST_TYPE,
					post_hash,
					undefined,
					EncryptedFileMetaSchema,
					({ shared_keys, ...rest }) => {
						// TODO: rotate the key so old owner can't access it anymore
						// requires to simplify quite a lot the bedrock service to avoid duplicated code
						delete shared_keys[contactPubKey];

						return {
							shared_keys,
							...rest,
						};
					},
				);

				return {
					files: newFiles.map(({ post_hash, path, shared_with }) => ({
						post_hash,
						path: EncryptionService.encryptEcies(path, this.alephService.encryptionPrivateKey.publicKey.compressed),
						shared_with,
					})),
				};
			},
		);
	}

	async fetchFilesSharedByContact(contact: Pick<ContactSchema, "address" | "public_key">): Promise<FileFullInfos[]> {
		const fileEntries = (
			await this.alephService.fetchAggregate(FILE_ENTRIES_AGGREGATE_KEY, EncryptedFileEntriesSchema)
		).files
			.filter(({ shared_with }) => shared_with.includes(contact.public_key))
			.map(({ path: _, ...rest }) => ({ path: "/", ...rest }));

		return this.fetchFilesMetaFromEntries(...fileEntries);
	}

	async fetchFilesShared(): Promise<FileFullInfos[]> {
		const fileEntries = (
			await this.alephService.fetchAggregate(FILE_ENTRIES_AGGREGATE_KEY, EncryptedFileEntriesSchema)
		).files
			.filter(({ shared_with }) => shared_with.includes(this.alephPublicKey))
			.map(({ path: _, ...rest }) => ({ path: "/", ...rest }));

		return this.fetchFilesMetaFromEntries(...fileEntries);
	}

	private fileExists(files: FileEntry[], path: string): boolean {
		return files.some((entry) => entry.path === path);
	}

	private async postFile({
		key,
		iv,
		store_hash,
		created_at,
		deleted_at,
		size,
	}: Omit<FileFullInfos, "post_hash" | "path">): Promise<string> {
		const bufferKey = Buffer.from(key, "hex");
		const bufferIv = Buffer.from(iv, "hex");
		const fileData: EncryptedFileMeta = {
			key: EncryptionService.encryptEcies(key, this.alephService.encryptionPrivateKey.publicKey.compressed),
			iv: EncryptionService.encryptEcies(iv, this.alephService.encryptionPrivateKey.publicKey.compressed),
			store_hash: EncryptionService.encrypt(store_hash, bufferKey, bufferIv),
			size: EncryptionService.encrypt(size.toString(), bufferKey, bufferIv),
			created_at: EncryptionService.encrypt(created_at, bufferKey, bufferIv),
			deleted_at: EncryptionService.encrypt(deleted_at ?? "null", bufferKey, bufferIv),
			shared_keys: {},
		};
		const { item_hash } = await this.alephService.createPost(FILE_POST_TYPE, fileData);
		return item_hash;
	}

	private decryptFilesPaths(files: EncryptedFileEntry[]): FileEntry[] {
		return files.map(({ post_hash, path, shared_with }) => ({
			post_hash,
			path: EncryptionService.decryptEcies(path, this.alephService.encryptionPrivateKey.secret),
			shared_with,
		}));
	}
}
