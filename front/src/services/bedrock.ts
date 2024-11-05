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

export const FileMetaSchema = z.object({
	key: z.string().regex(/^[a-f0-9]{64}$/, {
		message: "Invalid key format. It should be a 64-character hexadecimal string.",
	}),
	iv: z.string().regex(/^[a-f0-9]{32}$/, {
		message: "Invalid IV format. It should be a 32-character hexadecimal string.",
	}),
	ipfs_hash: z.string().regex(/^[a-f0-9]{64}$/, {
		message: "Invalid hash format. It should be a 64-character hexadecimal string.",
	}),
});

export type FileEntry = z.infer<typeof FileEntrySchema>;
export type FileMeta = z.infer<typeof FileMetaSchema>;
export type FileFullInfos = FileEntry & FileMeta;
export type DirectoryPath = `${string}/`;

export default class BedrockService {
	constructor(private alephService: AlephService) {}

	async uploadFiles(directory_path: DirectoryPath, ...files: File[]): Promise<Omit<FileFullInfos, "post_hash">[]> {
		const results = await Promise.allSettled(
			files
				.map((file) => ({
					file,
					key: EncryptionService.generateKey(),
					iv: EncryptionService.generateIv(),
				}))
				.map(({ file, key, iv }) => ({ file: EncryptionService.encryptFile(file, key, iv), iv, key }))
				.map(async ({ file, key, iv }, index) => {
					const { item_hash } = await this.alephService.uploadFile(await file);
					return {
						key: key.toString("hex"),
						iv: iv.toString("hex"),
						ipfs_hash: item_hash,
						path: `${directory_path}${files[index].name}`,
					};
				}),
		);

		return results
			.filter((result, index) => {
				if (result.status === "rejected") {
					console.error(`Failed to upload file: ${files[index].name}`, result.reason);
					toast.error(`Failed to upload file: ${files[index].name}`);
					return false;
				}
				return true;
			})
			.map((result) => (result as PromiseFulfilledResult<Omit<FileFullInfos, "post_hash">>).value);
	}

	// The difference between this method and the uploadFiles method is that this method saves the file hash to blockchain so that it can be fetched later
	async saveFile(fileInfos: Omit<FileFullInfos, "post_hash">): Promise<void> {
		const { key, iv, ipfs_hash, path } = FileEntrySchema.omit({ post_hash: true }).and(FileMetaSchema).parse(fileInfos); // Validate the input because fileEntry can be built without using the parse method

		const { item_hash } = await this.alephService.createPost("bedrock_file", {
			key: EncryptionService.encryptEcies(key, this.alephService.encryptionPrivateKey.publicKey.compressed),
			iv: EncryptionService.encryptEcies(iv, this.alephService.encryptionPrivateKey.publicKey.compressed),
			ipfs_hash,
		});
		await this.alephService.updateAggregate(
			"bedrock_file_entries",
			z.array(FileEntrySchema).default([]),
			(oldContent) => {
				if (oldContent.some((entry) => entry.path === path)) throw new Error(`File already exists at path: ${path}`);
				return [
					...oldContent,
					{
						post_hash: item_hash,
						path: EncryptionService.encryptEcies(path, this.alephService.encryptionPrivateKey.publicKey.compressed),
					},
				];
			},
		);
	}

	async fetchFileEntries(): Promise<FileEntry[]> {
		return (await this.alephService.fetchAggregate("bedrock_file_entries", z.array(FileEntrySchema).default([]))).map(
			({ post_hash, path }) => ({
				post_hash,
				path: EncryptionService.decryptEcies(path, this.alephService.encryptionPrivateKey.secret),
			}),
		);
	}
}
