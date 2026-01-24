"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { canConvertWithPandoc } from "@/services/pandoc";
import { useAccountStore } from "@/stores/account";
import { DriveFile, useDriveStore } from "@/stores/drive";
import { getFileTypeInfo } from "@/utils/file-types";

import AudioPreview from "./previews/AudioPreview";
import CodePreview from "./previews/CodePreview";
import DocxPreview from "./previews/DocxPreview";
import ImagePreview from "./previews/ImagePreview";
import OdtPreview from "./previews/OdtDocumentManager";
import PDFPreview from "./previews/PDFPreview";
import PptxPreview from "./previews/PptxPreview";
import UnsupportedPreview from "./previews/UnsupportedPreview";
import VideoPreview from "./previews/VideoPreview";
import XlsxPreview from "./previews/XlsxPreview";

interface FilePreviewDialogProps {
	file: DriveFile | null;
	isOpen: boolean;
	onClose: () => void;
	onDownload?: () => void;
}

export default function FilePreviewDialog({
																						file,
																						isOpen,
																						onClose,
																						onDownload
																					}: FilePreviewDialogProps) {
	const [fileContent, setFileContent] = useState<Blob | null>(null);
	const [fileUrl, setFileUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { bedrockClient } = useAccountStore();
	const {
		setFiles,
		files
	} = useDriveStore();
	const loadingRef = useRef<string | null>(null);
	const loadedFileRef = useRef<string | null>(null);

	const fileTypeInfo = useMemo(() => {
		return file ? getFileTypeInfo(file.path) : null;
	}, [file]);

	useEffect(() => {
		return () => {
			if (fileUrl) {
				URL.revokeObjectURL(fileUrl);
				setFileUrl(null);
			}
		};
	}, [fileUrl]);

	useEffect(() => {
		if (!isOpen || !file) {
			setFileContent(null);
			setFileUrl(null);
			setError(null);
			setIsLoading(false);
			loadingRef.current = null;
			loadedFileRef.current = null;
			return;
		}

		if (!fileTypeInfo?.canPreview) {
			setFileContent(null);
			setFileUrl(null);
			loadedFileRef.current = null;
			return;
		}

		const fileId = file.store_hash;

		if (loadedFileRef.current === fileId) {
			return;
		}

		if (loadingRef.current === fileId) {
			return;
		}

		loadingRef.current = fileId;
		setIsLoading(true);
		setError(null);

		(async () => {
			try {
				if (!bedrockClient) {
					throw new Error("Bedrock client failed.");
				}
				const buffer = await bedrockClient.files.downloadFile(file);
				// @ts-expect-error - Type mismatch between Node Buffer and Web ArrayBuffer
				const blob = new Blob([buffer], { type: fileTypeInfo.mimeType });

				const url = URL.createObjectURL(blob);

				if (loadingRef.current === fileId) {
					setFileContent(blob);
					setFileUrl(url);
					setIsLoading(false);
					loadedFileRef.current = fileId;
					loadingRef.current = null;
				} else {
					URL.revokeObjectURL(url);
				}
			} catch (err) {
				console.error("Failed to load file:", err);
				if (loadingRef.current === fileId) {
					setError(err instanceof Error ? err.message : "Failed to load file");
					setIsLoading(false);
					loadingRef.current = null;
					loadedFileRef.current = null;
				}
			}
		})();
	}, [file, isOpen, bedrockClient, fileTypeInfo]);

	const handleSaveEdit = async (editedFile: File) => {
		if (!bedrockClient || !file) {
			toast.error("Bedrock client not available");
			return;
		}

		try {
			const arrayBuffer = await editedFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			const uploadPromise = bedrockClient.files.editFileContent(file, buffer);

			toast.promise(uploadPromise, {
				loading: "Saving file...",
				success: "File saved successfully",
				error: (err) => `Failed to save file: ${err}`
			});

			const updatedFile = await uploadPromise;

			// Update the file in the store instead of creating a new one
			setFiles(
				files.map((f) =>
					f.path === file.path
						? {
							...updatedFile,
							content: buffer // Keep the content in memory
						}
						: f
				)
			);

			loadedFileRef.current = null;
			setFileContent(null);
			setFileUrl(null);
		} catch (err) {
			console.error("Failed to save file:", err);
			toast.error(`Failed to save file: ${err instanceof Error ? err.message : String(err)}`);
		}
	};

	const canEdit = useMemo(() => {
		return file && fileContent && canConvertWithPandoc(file.path);
	}, [file, fileContent]);

	if (!file || !fileTypeInfo) {
		return null;
	}

	const filename = file.path.split("/").pop() || file.path;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-6xl max-h-[90vh] h-[90vh] w-full p-0 flex flex-col">
				<DialogHeader className="px-6 py-4 border-b flex-shrink-0">
					<DialogTitle className="text-lg font-semibold truncate">{filename}</DialogTitle>
				</DialogHeader>

				<div className="flex-1 min-h-0 overflow-hidden">
					<ScrollArea className="h-full px-6 py-4">
						{isLoading ? (
							<div className="flex items-center justify-center h-64">
								<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
								<span className="ml-2 text-muted-foreground">Loading file...</span>
							</div>
						) : error ? (
							<div className="flex items-center justify-center h-64">
								<div className="text-center">
									<p className="text-destructive font-medium">Error loading file</p>
									<p className="text-sm text-muted-foreground mt-2">{error}</p>
								</div>
							</div>
						) : fileUrl && fileContent ? (
							<>
								{fileTypeInfo.category === "image" && <ImagePreview fileUrl={fileUrl} filename={filename} />}
								{fileTypeInfo.category === "video" && (
									<VideoPreview fileUrl={fileUrl} mimeType={fileTypeInfo.mimeType} />
								)}
								{fileTypeInfo.category === "audio" && (
									<AudioPreview fileUrl={fileUrl} mimeType={fileTypeInfo.mimeType} filename={filename} />
								)}
								{fileTypeInfo.category === "pdf" && (
									<PDFPreview fileUrl={fileUrl} filename={filename} onSave={canEdit ? handleSaveEdit : undefined} />
								)}
								{fileTypeInfo.category === "docx" && (
									<DocxPreview fileUrl={fileUrl} filename={filename} onSave={canEdit ? handleSaveEdit : undefined} />
								)}
								{fileTypeInfo.category === "odt" && (
									<OdtPreview fileUrl={fileUrl} filename={filename} onSave={canEdit ? handleSaveEdit : undefined} />
								)}
								{fileTypeInfo.category === "presentation" && (
									<PptxPreview fileUrl={fileUrl} filename={filename} onSave={canEdit ? handleSaveEdit : undefined} />
								)}
								{fileTypeInfo.category === "xlsx" && (
									<XlsxPreview fileUrl={fileUrl} filename={filename} onSave={undefined} />
								)}
								{(fileTypeInfo.category === "text" || fileTypeInfo.category === "code") && (
									<CodePreview
										fileUrl={fileUrl}
										filename={filename}
										category={fileTypeInfo.category}
										onSave={handleSaveEdit}
									/>
								)}
								{!fileTypeInfo.canPreview && (
									<UnsupportedPreview filename={filename} fileType={fileTypeInfo.category} />
								)}
							</>
						) : (
							<UnsupportedPreview filename={filename} fileType={fileTypeInfo.category} />
						)}
					</ScrollArea>
				</div>
			</DialogContent>
		</Dialog>
	);
}
