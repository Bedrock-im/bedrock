import { useCallback } from "react";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import { toast } from "sonner";

import BedrockService, { DirectoryPath } from "@/services/bedrock";

export type FileUploadOptions = { current_directory: DirectoryPath; bedrockService: BedrockService } & DropzoneOptions;

export default function useBedrockFileUploadDropzone({
	current_directory,
	bedrockService,
	...options
}: FileUploadOptions) {
	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (!bedrockService) return;
			const fileInfos = await bedrockService.uploadFiles(current_directory, ...acceptedFiles);
			let errors = 0;
			fileInfos.map(
				async (fileInfo) =>
					await bedrockService.saveFile(fileInfo).catch(() => {
						errors += 1;
						return toast.error(`Failed to save file ${fileInfo.path}`);
					}),
			);
			toast.success(`Successfully uploaded ${fileInfos.length - errors} files`);
		},
		[current_directory, bedrockService],
	);

	// Placing the onDrop function first allows the user to override it in the hooks' options
	return useDropzone({ onDrop, ...options });
}
