import { MessageNotFoundError } from "@aleph-sdk/message";
import { toast } from "sonner";
import { z } from "zod";

import { AlephService } from "@/services/aleph";
import { EncryptionService } from "@/services/encryption";

export const FileEntrySchema = z.object({
	path: z.string().regex(/^(\/[A-Za-z0-9-_+.]+)+$/, {
		message: "Invalid URI format. It should start with '/', contain valid path segments and do not end with a '/'.",
	}),
	post_hash: z.string().regex(/^[a-f0-9]{64}$/, {
		message: "Invalid hash format. It should be a 64-character hexadecimal string.",
	}),
});

export const EncryptedFileEntrySchema = z.object({
	path: z.string().regex(/^[a-f0-9]+$/, { message: "Invalid data, it should be encrypted and in hex format." }),
	post_hash: z.string().regex(/^[a-f0-9]{64}$/, {
		message: "Invalid hash format. It should be a 64-character hexadecimal string.",
	}),
});

export const FileMetaSchema = z.object({
	key: z.string().regex(/^[a-f0-9]{64}$/, {
		message: "Invalid key format. It should be a 64-character hexadecimal string.",
	}),
	iv: z.string().regex(/^[a-f0-9]{32}$/, {
		message: "Invalid IV format. It should be a 32-character hexadecimal string.",
	}),
	store_hash: z.string().regex(/^[a-f0-9]{64}$/, {
		message: "Invalid hash format. It should be a 64-character hexadecimal string.",
	}),
	size: z.number().int().nonnegative().default(42),
	created_at: z.string().datetime(),
	deleted_at: z.string().datetime().nullable(),
});

export const EncryptedFileMetaSchema = z.object({
	key: z.string().regex(/^[a-f0-9]+$/, { message: "Invalid data, it should be encrypted and in hex format." }),
	iv: z.string().regex(/^[a-f0-9]+$/, { message: "Invalid data, it should be encrypted and in hex format." }),
	store_hash: z.string().regex(/^[a-f0-9]+$/, { message: "Invalid data, it should be encrypted and in hex format." }),
	size: z.string().regex(/^[a-f0-9]+$/, { message: "Invalid data, it should be encrypted and in hex format." }),
	created_at: z.string().regex(/^[a-f0-9]+$/, { message: "Invalid data, it should be encrypted and in hex format." }),
	deleted_at: z.string().regex(/^[a-f0-9]+$/, { message: "Invalid data, it should be encrypted and in hex format." }),
});

export const FileFullInfosSchema = FileEntrySchema.merge(FileMetaSchema);
export const EncryptedFileFullInfosSchema = EncryptedFileEntrySchema.merge(EncryptedFileMetaSchema);

export const FileEntriesSchema = z.object({
	files: z.array(FileEntrySchema).default([]),
});

export const EncryptedFileEntriesSchema = z.object({
	files: z.array(EncryptedFileEntrySchema).default([]),
});

const FILE_ENTRIES_AGGREGATE_KEY = "bedrock_file_entries";
const FILE_POST_TYPE = "bedrock_file";

export type FileEntry = z.infer<typeof FileEntrySchema>;
export type FileMeta = z.infer<typeof FileMetaSchema>;
export type EncryptedFileEntry = z.infer<typeof EncryptedFileEntrySchema>;
export type EncryptedFileMeta = z.infer<typeof EncryptedFileMetaSchema>;
export type FileFullInfos = z.infer<typeof FileFullInfosSchema>;
export type EncryptedFileEntriesSchema = z.infer<typeof EncryptedFileEntriesSchema>;

export default class BedrockService {
	constructor(private alephService: AlephService) {}

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
		await this.alephService.updateAggregate(FILE_ENTRIES_AGGREGATE_KEY, EncryptedFileEntriesSchema, ({ files }) => {
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
					...newFiles.map(({ post_hash, path }) => ({
						post_hash,
						path: EncryptionService.encryptEcies(path, this.alephService.encryptionPrivateKey.publicKey.compressed),
					})),
				],
			};
		});
		if (newFiles.length === 0) return Promise.reject("No new files were saved");
		return newFiles;
	}

	fileExists(files: FileEntry[], path: string): boolean {
		return files.some((entry) => entry.path === path);
	}

	async fetchFileEntries(): Promise<FileEntry[]> {
		return (await this.alephService.fetchAggregate(FILE_ENTRIES_AGGREGATE_KEY, EncryptedFileEntriesSchema)).files.map(
			({ post_hash, path }) => ({
				post_hash,
				path: EncryptionService.decryptEcies(path, this.alephService.encryptionPrivateKey.secret),
			}),
		);
	}

	async fetchFilesMetaFromEntries(...fileEntries: FileEntry[]): Promise<FileFullInfos[]> {
		fileEntries = z.array(FileEntrySchema).parse(fileEntries); // Validate the input because fileEntry can be built without using the parse method

		const results = await Promise.allSettled(
			fileEntries.map(async ({ post_hash, path }) => {
				const { key, iv, ...rest } = await this.alephService.fetchPost(
					FILE_POST_TYPE,
					EncryptedFileMetaSchema,
					undefined,
					post_hash,
				);
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

		if (results.length === 0) return Promise.reject("No files were fetched");

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
		await this.alephService.updateAggregate(FILE_ENTRIES_AGGREGATE_KEY, EncryptedFileEntriesSchema, () => ({
			files: [],
		}));
	}

	async hardDeleteFiles(...fileInfos: Pick<FileFullInfos, "store_hash" | "path">[]): Promise<void> {
		fileInfos = z.array(FileFullInfosSchema.pick({ store_hash: true, path: true })).parse(fileInfos); // Validate the input because fileEntry can be built without using the parse method

		const filePaths = fileInfos.map(({ path }) => path);
		const fileStoreHashes = fileInfos.map(({ store_hash }) => store_hash);
		await this.alephService.updateAggregate(FILE_ENTRIES_AGGREGATE_KEY, EncryptedFileEntriesSchema, ({ files }) => {
			const decryptedFiles = this.decryptFilesPaths(files);
			const newFiles = decryptedFiles.filter(({ path }) => !filePaths.includes(path));
			return {
				files: newFiles.map(({ post_hash, path }) => ({
					post_hash,
					path: EncryptionService.encryptEcies(path, this.alephService.encryptionPrivateKey.publicKey.compressed),
				})),
			};
		});
		await this.alephService.deleteFiles(fileStoreHashes);
	}

	async moveFile(oldPath: string, newPath: string): Promise<void> {
		await this.alephService.updateAggregate(FILE_ENTRIES_AGGREGATE_KEY, EncryptedFileEntriesSchema, ({ files }) => {
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
				files: newFiles.map(({ post_hash, path }) => ({
					post_hash,
					path: EncryptionService.encryptEcies(path, this.alephService.encryptionPrivateKey.publicKey.compressed),
				})),
			};
		});
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
		const { item_hash } = await this.alephService.createPost(FILE_POST_TYPE, {
			key: EncryptionService.encryptEcies(key, this.alephService.encryptionPrivateKey.publicKey.compressed),
			iv: EncryptionService.encryptEcies(iv, this.alephService.encryptionPrivateKey.publicKey.compressed),
			store_hash: EncryptionService.encrypt(store_hash, bufferKey, bufferIv),
			size: EncryptionService.encrypt(size.toString(), bufferKey, bufferIv),
			created_at: EncryptionService.encrypt(created_at, bufferKey, bufferIv),
			deleted_at: EncryptionService.encrypt(deleted_at ?? "null", bufferKey, bufferIv),
		});
		return item_hash;
	}

	async downloadFileFromStoreHash(storeHash: string, key: string, iv: string): Promise<Buffer> {
		const encryptedBuffer = await this.alephService.downloadFile(storeHash);
		const bufferKey = Buffer.from(key, "hex");
		const bufferIv = Buffer.from(iv, "hex");
		return EncryptionService.decryptFile(encryptedBuffer, bufferKey, bufferIv);
	}


	private decryptFilesPaths(files: EncryptedFileEntry[]): FileEntry[] {
		return files.map(({ post_hash, path }) => ({
			post_hash,
			path: EncryptionService.decryptEcies(path, this.alephService.encryptionPrivateKey.secret),
		}));
	}
}
