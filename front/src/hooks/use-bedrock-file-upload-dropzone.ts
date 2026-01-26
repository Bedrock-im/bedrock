import { useQueryState } from "nuqs";
import { useCallback } from "react";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { useAccountStore } from "@/stores/account";
import { useDriveStore } from "@/stores/drive";

export default function useBedrockFileUploadDropzone(options: DropzoneOptions) {
	const bedrockClient = useAccountStore((state) => state.bedrockClient);
	const { addFiles } = useDriveStore();
	const [currentWorkingDirectory] = useQueryState("cwd", { defaultValue: "/" });

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (!bedrockClient) return;

			// Convert files to FileInput format
			const fileInputs = await Promise.all(
				acceptedFiles.map(async (file) => ({
					name: file.name,
					path: `${currentWorkingDirectory}${file.name}`,
					content: Buffer.from(await file.arrayBuffer()),
				})),
			);

			const uploadPromise = bedrockClient.files.uploadFiles(fileInputs);
			toast.promise(uploadPromise, {
				loading: `Uploading ${acceptedFiles.length} files...`,
				success: (uploadedFiles) => `Successfully uploaded ${uploadedFiles.length} files`,
				error: (err) => `Failed to upload files: ${err}`,
			});

			try {
				const uploadedFiles = await uploadPromise;
				const fileContents = await Promise.all(
					acceptedFiles.map(async (file) => ({
						content: Buffer.from(await file.arrayBuffer()),
						name: file.name,
					})),
				);

				addFiles(
					uploadedFiles.map((fileInfo) => ({
						...fileInfo,
						shared_keys: fileInfo.shared_keys ?? {},
						content: fileContents.find((fileContent) => fileContent.name === fileInfo.name)?.content,
					})),
				);
			} catch (err) {
				console.error("Failed to upload files:", err);
				toast.error(`Failed to upload files: ${err}`);
				return;
			}
		},
		[currentWorkingDirectory, bedrockClient, addFiles],
	);

	// Placing the onDrop function first allows the user to override it in the hooks' options
	return useDropzone({ onDrop, ...options });
}
