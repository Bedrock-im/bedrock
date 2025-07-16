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
	path: z.string(),
	post_hash: zod64CharHexString,
	shared_with: z.array(z.string()).default([]),
});

export const EncryptedFileEntrySchema = z.object({
	path: zodEncryptedHexString,
	post_hash: zod64CharHexString,
	shared_with: z.array(z.string()).default([]),
});

export const FileMetaSchema = z.object({
	name: z.string(),
	path: z.string(),
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
	name: zodEncryptedHexString,
	path: zodEncryptedHexString,
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

export const KnowledgeBaseSchema = z.object({
	name: z.string(),
	file_paths: z.array(z.string()),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime(),
});

export const EncryptedKnowledgeBaseSchema = z.object({
	name: zodEncryptedHexString,
	file_paths: z.array(zodEncryptedHexString),
	created_at: zodEncryptedHexString,
	updated_at: zodEncryptedHexString,
});

export const EncryptedKnowledgeBasesAggregateSchema = z.object({
	knowledge_bases: z.array(EncryptedKnowledgeBaseSchema),
});

const FILE_ENTRIES_AGGREGATE_KEY = "bedrock_file_entries";
const FILE_POST_TYPE = "bedrock_file";
const CONTACTS_AGGREGATE_KEY = "bedrock_contacts";
const KNOWLEDGE_BASES_AGGREGATE_KEY = "bedrock_knowledge_bases";

export type FileEntry = z.infer<typeof FileEntrySchema>;
export type FileMeta = z.infer<typeof FileMetaSchema>;
export type EncryptedFileEntry = z.infer<typeof EncryptedFileEntrySchema>;
export type EncryptedFileMeta = z.infer<typeof EncryptedFileMetaSchema>;
export type FileFullInfos = z.infer<typeof FileFullInfosSchema>;
export type EncryptedFileEntriesAggregate = z.infer<typeof EncryptedFileEntriesSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type EncryptedContact = z.infer<typeof EncryptedContactSchema>;
export type EncryptedContactsAggregate = z.infer<typeof EncryptedContactsAggregate>;
export type KnowledgeBase = z.infer<typeof KnowledgeBaseSchema>;
export type EncryptedKnowledgeBase = z.infer<typeof EncryptedKnowledgeBaseSchema>;
export type EncryptedKnowledgeBasesAggregate = z.infer<typeof EncryptedKnowledgeBasesAggregateSchema>;

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
				const emptyFileEntries: EncryptedFileEntriesAggregate = { files: [] };
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

		try {
			await this.fetchKnowledgeBases();
		} catch (err) {
			if (err instanceof MessageNotFoundError) {
				// New user with no kbs yet
				const emptyKnowledgeBases: EncryptedKnowledgeBasesAggregate = { knowledge_bases: [] };
				await this.alephService.createAggregate(KNOWLEDGE_BASES_AGGREGATE_KEY, emptyKnowledgeBases);
			}
		}
	}

	async duplicateFile(oldPath: string, newPath: string): Promise<string | undefined> {
		const fileEntries = await this.fetchFileEntries();
		const fullFiles = await this.fetchFilesMetaFromEntries(fileEntries);
		const original = fullFiles.find((f) => f.path === oldPath);
		if (!original) {
			console.error(`File not found at path: ${oldPath}`);
			toast.error(`File not found at path: ${oldPath}`);
			return;
		}

		const newName = newPath.split("/").pop()!;

		const newFileMeta: Omit<FileFullInfos, "post_hash"> = {
			...original,
			path: newPath,
			name: newName,
			created_at: new Date().toISOString(),
			deleted_at: null,
		};

		const post_hash = await this.postFile(newFileMeta);

		await this.alephService.updateAggregate("bedrock_file_entries", EncryptedFileEntriesSchema, async ({ files }) => ({
			files: [
				...files,
				{
					post_hash,
					path: EncryptionService.encryptEcies(newPath, this.alephService.encryptionPrivateKey.publicKey.compressed),
					shared_with: [],
				},
			],
		}));

		return post_hash;
	}

	async uploadFiles(directoryPath: string, files: File[]): Promise<Omit<FileFullInfos, "post_hash">[]> {
		const uploadedFiles = await this.fetchFileEntries();
		const results = await Promise.allSettled(
			files
				.map((file) => ({
					file,
					path: `${directoryPath}${file.name}`,
					name: file.name,
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
				fileInfos.map(async (file) => ({
					post_hash: await this.postFile(file),
					path: file.path,
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

	async fetchKnowledgeBases(): Promise<KnowledgeBase[]> {
		return (
			await this.alephService.fetchAggregate(KNOWLEDGE_BASES_AGGREGATE_KEY, EncryptedKnowledgeBasesAggregateSchema)
		).knowledge_bases.map(({ name, file_paths, created_at, updated_at }) => ({
			name: EncryptionService.decryptEcies(name, this.alephService.encryptionPrivateKey.secret),
			file_paths: file_paths.map((file_path) =>
				EncryptionService.decryptEcies(file_path, this.alephService.encryptionPrivateKey.secret),
			),
			created_at: EncryptionService.decryptEcies(created_at, this.alephService.encryptionPrivateKey.secret),
			updated_at: EncryptionService.decryptEcies(updated_at, this.alephService.encryptionPrivateKey.secret),
		}));
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

	async fetchContacts(): Promise<Contact[]> {
		return (await this.alephService.fetchAggregate(CONTACTS_AGGREGATE_KEY, EncryptedContactsAggregate)).contacts.map(
			(contact) => ({
				name: EncryptionService.decryptEcies(contact.name, this.alephService.encryptionPrivateKey.secret),
				public_key: contact.public_key,
				address: contact.address,
			}),
		);
	}

	async fetchFilesMetaFromEntries(fileEntries: FileEntry[], owner?: string): Promise<FileFullInfos[]> {
		fileEntries = z.array(FileEntrySchema).parse(fileEntries); // Validate the input because fileEntry can be built without using the parse method

		const results = await Promise.allSettled(
			fileEntries.map(async ({ post_hash }) => {
				// eslint-disable-next-line prefer-const
				let { key, iv, shared_keys, ...rest } = await this.alephService.fetchPost(
					FILE_POST_TYPE,
					EncryptedFileMetaSchema,
					owner ? [owner] : undefined,
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
					path: EncryptionService.decrypt(rest.path, bufferKey, bufferIv),
					size: parseInt(EncryptionService.decrypt(rest.size, bufferKey, bufferIv), 10),
					created_at: EncryptionService.decrypt(rest.created_at, bufferKey, bufferIv),
					deleted_at: decryptedDeletedAt === "null" ? null : decryptedDeletedAt,
					name: EncryptionService.decrypt(rest.name, bufferKey, bufferIv),
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

	async resetData(): Promise<void> {
		// TODO: also forget the POST, STORE files etc
		await this.resetFiles();
		await this.resetContacts();
		await this.resetKnowledgeBases();
	}

	async resetFiles(): Promise<void> {
		await this.alephService.updateAggregate(FILE_ENTRIES_AGGREGATE_KEY, EncryptedFileEntriesSchema, async () => ({
			files: [],
		}));
	}

	async resetContacts(): Promise<void> {
		await this.alephService.updateAggregate(CONTACTS_AGGREGATE_KEY, EncryptedContactsAggregate, async () => ({
			contacts: [],
		}));
	}

	async resetKnowledgeBases(): Promise<void> {
		await this.alephService.updateAggregate(
			KNOWLEDGE_BASES_AGGREGATE_KEY,
			EncryptedKnowledgeBasesAggregateSchema,
			async () => ({
				knowledge_bases: [],
			}),
		);
	}

	async softDeleteFiles(
		fileInfos: Pick<FileFullInfos, "post_hash" | "name" | "path">[],
		deletionDatetime: Date,
		newPath?: string,
	): Promise<void> {
		const files = z.array(FileFullInfosSchema.pick({ post_hash: true, name: true, path: true })).parse(fileInfos);

		const filePaths: { old: string; new: string }[] = [];

		await Promise.all(
			files.map(async ({ post_hash, path: _, name }) => {
				await this.alephService.updatePost(
					FILE_POST_TYPE,
					post_hash,
					undefined,
					EncryptedFileMetaSchema,
					({ deleted_at: _, path, ...rest }) => {
						const key = Buffer.from(
							EncryptionService.decryptEcies(rest.key, this.alephService.encryptionPrivateKey.secret),
							"hex",
						);
						const iv = Buffer.from(
							EncryptionService.decryptEcies(rest.iv, this.alephService.encryptionPrivateKey.secret),
							"hex",
						);
						filePaths.push();
						console.log("newPath", newPath);
						console.log('newPath?.split("/").pop()!', newPath?.split("/").pop());
						return {
							deleted_at: EncryptionService.encrypt(deletionDatetime.toISOString(), key, iv),
							path: newPath === undefined ? EncryptionService.encrypt(newPath + "/" + name, key, iv) : path,
							...rest,
						};
					},
				);
			}),
		);

		console.log("filePaths", filePaths);

		await this.alephService.updateAggregate(
			FILE_ENTRIES_AGGREGATE_KEY,
			EncryptedFileEntriesSchema,
			async ({ files }) => {
				const decryptedFiles = this.decryptFilesPaths(files);
				return {
					files: decryptedFiles.map(({ post_hash, path, shared_with }) => ({
						post_hash,
						path: EncryptionService.encryptEcies(
							filePaths.find(({ old }) => old === path)?.new ?? path,
							this.alephService.encryptionPrivateKey.publicKey.compressed,
						),
						shared_with,
					})),
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
				const newFileName = newFiles[fileIndex].path.split("/").pop()!;
				await this.alephService.updatePost(
					FILE_POST_TYPE,
					newFiles[fileIndex].post_hash,
					undefined,
					EncryptedFileMetaSchema,
					({ path: _, name: __, ...rest }) => {
						const key = Buffer.from(
							EncryptionService.decryptEcies(rest.key, this.alephService.encryptionPrivateKey.secret),
							"hex",
						);
						const iv = Buffer.from(
							EncryptionService.decryptEcies(rest.iv, this.alephService.encryptionPrivateKey.secret),
							"hex",
						);
						return {
							path: EncryptionService.encrypt(newPath, key, iv),
							name: EncryptionService.encrypt(newFileName, key, iv),
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

	async downloadFileFromStoreHash(storeHash: string, key: string, iv: string): Promise<Buffer> {
		const encryptedBuffer = await this.alephService.downloadFile(storeHash);
		const bufferKey = Buffer.from(key, "hex");
		const bufferIv = Buffer.from(iv, "hex");
		return EncryptionService.decryptFile(encryptedBuffer, bufferKey, bufferIv);
	}

	async createKnowledgeBase(name: string) {
		await this.alephService.updateAggregate(
			KNOWLEDGE_BASES_AGGREGATE_KEY,
			EncryptedKnowledgeBasesAggregateSchema,
			async ({ knowledge_bases }) => {
				const names = knowledge_bases.map(({ name }) =>
					EncryptionService.decryptEcies(name, this.alephService.encryptionPrivateKey.secret),
				);

				if (names.includes(name)) {
					throw new Error("This knowledge base name already exists");
				}

				return {
					knowledge_bases: [
						{
							name: EncryptionService.encryptEcies(name, this.alephService.encryptionPrivateKey.publicKey.compressed),
							file_paths: [],
							created_at: EncryptionService.encryptEcies(
								new Date().toISOString(),
								this.alephService.encryptionPrivateKey.publicKey.compressed,
							),
							updated_at: EncryptionService.encryptEcies(
								new Date().toISOString(),
								this.alephService.encryptionPrivateKey.publicKey.compressed,
							),
						},
						...knowledge_bases,
					],
				};
			},
		);
	}

	async deleteKnowledgeBase(name: string) {
		await this.alephService.updateAggregate(
			KNOWLEDGE_BASES_AGGREGATE_KEY,
			EncryptedKnowledgeBasesAggregateSchema,
			async ({ knowledge_bases }) => ({
				knowledge_bases: knowledge_bases
					.map(({ name, ...rest }) => ({
						name: EncryptionService.decryptEcies(name, this.alephService.encryptionPrivateKey.secret),
						...rest,
					}))
					.filter((kb) => kb.name !== name)
					.map(({ name, ...rest }) => ({
						name: EncryptionService.encryptEcies(name, this.alephService.encryptionPrivateKey.publicKey.compressed),
						...rest,
					})),
			}),
		);
	}

	async renameKnowledgeBase(oldName: string, newName: string) {
		await this.alephService.updateAggregate(
			KNOWLEDGE_BASES_AGGREGATE_KEY,
			EncryptedKnowledgeBasesAggregateSchema,
			async ({ knowledge_bases }) => ({
				knowledge_bases: knowledge_bases.map(({ name, ...rest }) => {
					const decryptedName = EncryptionService.decryptEcies(name, this.alephService.encryptionPrivateKey.secret);
					return {
						name:
							decryptedName === oldName
								? EncryptionService.encryptEcies(newName, this.alephService.encryptionPrivateKey.publicKey.compressed)
								: name,
						...rest,
					};
				}),
			}),
		);
	}

	async setKnowledgeBaseFiles(name: string, filePaths: string[]) {
		await this.alephService.updateAggregate(
			KNOWLEDGE_BASES_AGGREGATE_KEY,
			EncryptedKnowledgeBasesAggregateSchema,
			async ({ knowledge_bases }) => ({
				knowledge_bases: knowledge_bases.map(({ name: kbName, file_paths, updated_at, ...rest }) => {
					const decryptedName = EncryptionService.decryptEcies(kbName, this.alephService.encryptionPrivateKey.secret);
					if (decryptedName !== name) {
						return {
							name: kbName,
							file_paths,
							updated_at,
							...rest,
						};
					}
					return {
						name: kbName,
						file_paths: filePaths.map((filePath) =>
							EncryptionService.encryptEcies(filePath, this.alephService.encryptionPrivateKey.publicKey.compressed),
						),
						updated_at: EncryptionService.encryptEcies(
							new Date().toISOString(),
							this.alephService.encryptionPrivateKey.publicKey.compressed,
						),
						...rest,
					};
				}),
			}),
		);
	}

	async removeFileFromKnowledgeBase(name: string, filePath: string) {
		await this.alephService.updateAggregate(
			KNOWLEDGE_BASES_AGGREGATE_KEY,
			EncryptedKnowledgeBasesAggregateSchema,
			async ({ knowledge_bases }) => ({
				knowledge_bases: knowledge_bases.map(({ name: kbName, file_paths, updated_at, ...rest }) => {
					const decryptedName = EncryptionService.decryptEcies(kbName, this.alephService.encryptionPrivateKey.secret);
					if (decryptedName !== name) {
						return {
							name: kbName,
							file_paths,
							updated_at,
							...rest,
						};
					}
					return {
						name: kbName,
						file_paths: file_paths.filter(
							(kbFilePath) =>
								EncryptionService.decryptEcies(
									kbFilePath,
									this.alephService.encryptionPrivateKey.publicKey.compressed,
								) !== filePath,
						),
						updated_at: EncryptionService.encryptEcies(
							new Date().toISOString(),
							this.alephService.encryptionPrivateKey.publicKey.compressed,
						),
						...rest,
					};
				}),
			}),
		);
	}

	async addFileToKnowledgeBase(name: string, filePath: string) {
		await this.alephService.updateAggregate(
			KNOWLEDGE_BASES_AGGREGATE_KEY,
			EncryptedKnowledgeBasesAggregateSchema,
			async ({ knowledge_bases }) => ({
				knowledge_bases: knowledge_bases.map(({ name: kbName, file_paths, updated_at, ...rest }) => {
					const decryptedName = EncryptionService.decryptEcies(kbName, this.alephService.encryptionPrivateKey.secret);
					if (decryptedName !== name) {
						return {
							name: kbName,
							file_paths,
							updated_at,
							...rest,
						};
					}
					return {
						name: kbName,
						file_paths: [
							...file_paths,
							EncryptionService.encryptEcies(filePath, this.alephService.encryptionPrivateKey.publicKey.compressed),
						],
						updated_at: EncryptionService.encryptEcies(
							new Date().toISOString(),
							this.alephService.encryptionPrivateKey.publicKey.compressed,
						),
						...rest,
					};
				}),
			}),
		);
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

	async fetchFilesSharedByContact(contact: Pick<Contact, "address" | "public_key">): Promise<FileFullInfos[]> {
		const fileEntries = (
			await this.alephService.fetchAggregate(FILE_ENTRIES_AGGREGATE_KEY, EncryptedFileEntriesSchema, contact.address)
		).files.filter(({ shared_with }) => shared_with.includes(this.alephPublicKey));
		return this.fetchFilesMetaFromEntries(fileEntries, contact.address);
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
		name,
		path,
	}: Omit<FileFullInfos, "post_hash">): Promise<string> {
		const bufferKey = Buffer.from(key, "hex");
		const bufferIv = Buffer.from(iv, "hex");
		const fileData: EncryptedFileMeta = {
			name: EncryptionService.encrypt(name, bufferKey, bufferIv),
			path: EncryptionService.encrypt(path, bufferKey, bufferIv),
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
