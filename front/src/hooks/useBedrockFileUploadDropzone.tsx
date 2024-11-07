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
			const fileInfos = bedrockService.uploadFiles(current_directory, ...acceptedFiles);
			toast.promise(fileInfos, {
				loading: `Uploading ${acceptedFiles.length} files...`,
				success: (uploadedFiles) => `Successfully uploaded ${uploadedFiles.length} files`,
				error: (err) => `Failed to upload files: ${err}`,
			});
			const awaitedFileInfos = await fileInfos;
			if (awaitedFileInfos.length === 0) return;
			const fileEntries = bedrockService.saveFiles(...awaitedFileInfos);
			toast.promise(fileEntries, {
				loading: `Saving ${awaitedFileInfos.length} files...`,
				success: (savedFiles) => `Successfully saved ${savedFiles.length} files`,
				error: (err) => `Failed to save files: ${err}`,
			});
		},
		[current_directory, bedrockService],
	);

	// Placing the onDrop function first allows the user to override it in the hooks' options
	return useDropzone({ onDrop, ...options });
}
