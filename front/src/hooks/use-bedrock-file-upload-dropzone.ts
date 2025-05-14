import { useQueryState } from "nuqs";
import { useCallback } from "react";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { useAccountStore } from "@/stores/account";
import { useDriveStore } from "@/stores/drive";

export default function useBedrockFileUploadDropzone(options: DropzoneOptions) {
	const bedrockService = useAccountStore((state) => state.bedrockService);
	const { addFiles } = useDriveStore();
	const [currentWorkingDirectory] = useQueryState("cwd", { defaultValue: "/" });

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (!bedrockService) return;
			const fileInfos = bedrockService.uploadFiles(currentWorkingDirectory, ...acceptedFiles);
			toast.promise(fileInfos, {
				loading: `Uploading ${acceptedFiles.length} files...`,
				success: (uploadedFiles) => `Successfully uploaded ${uploadedFiles.length} files`,
				error: (err) => `Failed to upload files: ${err}`,
			});
			const awaitedFileInfos = await fileInfos.catch(() => []);
			if (awaitedFileInfos.length === 0) return;
			const safeFileInfos = awaitedFileInfos.map((info) => ({
				...info,
				shared_keys: info.shared_keys ?? {},
			}));
			const fileEntries = bedrockService.saveFiles(...safeFileInfos);
			toast.promise(fileEntries, {
				loading: `Saving ${awaitedFileInfos.length} files...`,
				success: (savedFiles) => `Successfully saved ${savedFiles.length} files`,
				error: (err) => `Failed to save files: ${err}`,
			});
			const awaitedFileEntries = await fileEntries.catch(() => []);
			addFiles(
				awaitedFileInfos.map(({ path, ...fileInfo }) => ({
					...fileInfo,
					path,
					post_hash: awaitedFileEntries.find((entry) => entry.path === path)!.post_hash,
				})),
			);
		},
		[currentWorkingDirectory, bedrockService, addFiles],
	);

	// Placing the onDrop function first allows the user to override it in the hooks' options
	return useDropzone({ onDrop, ...options });
}
