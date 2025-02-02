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
});

export const EncryptedFileMetaSchema = z.object({
	key: z.string().regex(/^[a-f0-9]+$/, { message: "Invalid data, it should be encrypted and in hex format." }),
	iv: z.string().regex(/^[a-f0-9]+$/, { message: "Invalid data, it should be encrypted and in hex format." }),
	store_hash: z.string().regex(/^[a-f0-9]+$/, { message: "Invalid data, it should be encrypted and in hex format." }),
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
export type DirectoryPath = `/${string}/` | "/";
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

	async uploadFiles(directoryPath: DirectoryPath, ...files: File[]): Promise<Omit<FileFullInfos, "post_hash">[]> {
		const uploadedFiles = await this.fetchFileEntries();
		const results = await Promise.allSettled(
			files
				.map((file) => ({ file, path: `${directoryPath}${file.name}` }))
				.filter(({ path }) => {
					if (this.fileExists(uploadedFiles, path)) {
						console.error(`File already exists at path: ${path}`);
						toast.error(`File already exists at path: ${path}`);
						return false;
					}
					return true;
				})
				.map(({ file, path }) => ({
					file,
					key: EncryptionService.generateKey(),
					iv: EncryptionService.generateIv(),
					path,
				}))
				.map(({ file, key, iv, path }) => ({ file: EncryptionService.encryptFile(file, key, iv), iv, key, path }))
				.map(async ({ file, key, iv, path }) => {
					const { item_hash } = await this.alephService.uploadFile(await file);
					return {
						key: key.toString("hex"),
						iv: iv.toString("hex"),
						store_hash: item_hash,
						path,
					};
				}),
		);

		if (results.length === 0) return Promise.reject("No files were uploaded");

		return results
			.filter((result, index): result is PromiseFulfilledResult<Omit<FileFullInfos, "post_hash">> => {
				if (result.status === "rejected") {
					console.error(`Failed to upload file: ${files[index].name}`, result.reason);
					toast.error(`Failed to upload file: ${files[index].name}`);
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
				fileInfos.map(async ({ path, ...rest }) => ({ post_hash: await this.postFile(rest), path })),
			)
		)
			.filter((result): result is PromiseFulfilledResult<FileEntry> => result.status === "fulfilled")
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

	private async postFile({ key, iv, store_hash }: Omit<FileFullInfos, "post_hash" | "path">): Promise<string> {
		const { item_hash } = await this.alephService.createPost(FILE_POST_TYPE, {
			key: EncryptionService.encryptEcies(key, this.alephService.encryptionPrivateKey.publicKey.compressed),
			iv: EncryptionService.encryptEcies(iv, this.alephService.encryptionPrivateKey.publicKey.compressed),
			store_hash,
		});
		return item_hash;
	}

	private decryptFilesPaths(files: EncryptedFileEntry[]): FileEntry[] {
		return files.map(({ post_hash, path }) => ({
			post_hash,
			path: EncryptionService.decryptEcies(path, this.alephService.encryptionPrivateKey.secret),
		}));
	}
}
