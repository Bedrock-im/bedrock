import { useCallback } from "react";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { useAccountStore } from "@/stores/account";
import { useDriveParametersStore } from "@/stores/driveParameters";

export default function useBedrockFileUploadDropzone(options: DropzoneOptions) {
	const bedrockService = useAccountStore((state) => state.bedrockService);
	const currentDirectoryPath = useDriveParametersStore((state) => state.currentDirectoryPath);

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (!bedrockService) return;
			const fileInfos = bedrockService.uploadFiles(currentDirectoryPath, ...acceptedFiles);
			toast.promise(fileInfos, {
				loading: `Uploading ${acceptedFiles.length} files...`,
				success: (uploadedFiles) => `Successfully uploaded ${uploadedFiles.length} files`,
				error: (err) => `Failed to upload files: ${err}`,
			});
			const awaitedFileInfos = await fileInfos.catch(() => []);
			if (awaitedFileInfos.length === 0) return;
			const fileEntries = bedrockService.saveFiles(...awaitedFileInfos);
			toast.promise(fileEntries, {
				loading: `Saving ${awaitedFileInfos.length} files...`,
				success: (savedFiles) => `Successfully saved ${savedFiles.length} files`,
				error: (err) => `Failed to save files: ${err}`,
			});
		},
		[currentDirectoryPath, bedrockService],
	);

	// Placing the onDrop function first allows the user to override it in the hooks' options
	return useDropzone({ onDrop, ...options });
}
