"use client";

import { Download, Edit, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAccountStore } from "@/stores/account";
import { DriveFile } from "@/stores/drive";
import { getFileTypeInfo } from "@/utils/file-types";
import { canConvertWithPandoc } from "@/services/pandoc";

import AudioPreview from "./previews/AudioPreview";
import CodePreview from "./previews/CodePreview";
import DocxPreview from "./previews/DocxPreview";
import EditablePandocPreview from "./previews/EditablePandocPreview";
import ImagePreview from "./previews/ImagePreview";
import PDFPreview from "./previews/PDFPreview";
import UnsupportedPreview from "./previews/UnsupportedPreview";
import VideoPreview from "./previews/VideoPreview";
import XlsxPreview from "./previews/XlsxPreview";

interface FilePreviewDialogProps {
	file: DriveFile | null;
	isOpen: boolean;
	onClose: () => void;
	onDownload?: () => void;
}

export default function FilePreviewDialog({ file, isOpen, onClose, onDownload }: FilePreviewDialogProps) {
	const [fileContent, setFileContent] = useState<Blob | null>(null);
	const [fileUrl, setFileUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isEditMode, setIsEditMode] = useState(false);
	const [editFile, setEditFile] = useState<File | null>(null);
	const { bedrockClient } = useAccountStore();
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
			setIsEditMode(false);
			setEditFile(null);
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

	const handleDownload = () => {
		if (onDownload) {
			onDownload();
		} else if (fileUrl && file) {
			const link = document.createElement("a");
			link.href = fileUrl;
			link.download = file.path.split("/").pop() || "download";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
		onClose();
	};

	const handleEdit = () => {
		if (!fileContent || !file) return;

		const filename = file.path.split("/").pop() || file.path;
		const fileObj = new File([fileContent], filename, { type: fileTypeInfo?.mimeType || "application/octet-stream" });
		setEditFile(fileObj);
		setIsEditMode(true);
	};

	const handleSaveEdit = async (editedFile: File) => {
		if (!bedrockClient || !file) {
			toast.error("Bedrock client not available");
			return;
		}

		try {
			const arrayBuffer = await editedFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			// Get the directory path
			const pathParts = file.path.split("/");
			pathParts.pop(); // Remove filename
			const directory = pathParts.length > 0 ? pathParts.join("/") : "/";

			// Upload the edited file (this will replace the existing file)
			const uploadPromise = bedrockClient.files.uploadFiles(
				[
					{
						name: file.name,
						path: file.path,
						content: buffer,
					},
				],
				directory,
			);

			toast.promise(uploadPromise, {
				loading: "Saving file...",
				success: "File saved successfully",
				error: (err) => `Failed to save file: ${err}`,
			});

			await uploadPromise;

			// Reload the file content
			loadedFileRef.current = null;
			setIsEditMode(false);
			setEditFile(null);

			// Trigger a reload by resetting the file content
			setFileContent(null);
			setFileUrl(null);
		} catch (err) {
			console.error("Failed to save file:", err);
			toast.error(`Failed to save file: ${err instanceof Error ? err.message : String(err)}`);
		}
	};

	const handleCancelEdit = () => {
		setIsEditMode(false);
		setEditFile(null);
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
					<div className="flex items-center justify-between">
						<DialogTitle className="text-lg font-semibold truncate flex-1 mr-4">{filename}</DialogTitle>
						<div className="flex items-center gap-2">
							{!isEditMode && canEdit && (
								<Button variant="outline" size="sm" onClick={handleEdit} disabled={isLoading || !fileContent}>
									<Edit className="h-4 w-4 mr-2" />
									Edit
								</Button>
							)}
							<Button variant="outline" size="sm" onClick={handleDownload} disabled={isLoading || !fileUrl || isEditMode}>
								<Download className="h-4 w-4 mr-2" />
								Download
							</Button>
						</div>
					</div>
				</DialogHeader>

				<div className="flex-1 min-h-0 overflow-hidden">
					{isEditMode && editFile ? (
						<div className="h-full px-6 py-4">
							<EditablePandocPreview
								file={editFile}
								filename={filename}
								onSave={handleSaveEdit}
								onCancel={handleCancelEdit}
							/>
						</div>
					) : (
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
									{fileTypeInfo.category === "pdf" && <PDFPreview fileUrl={fileUrl} />}
									{fileTypeInfo.category === "docx" && <DocxPreview fileUrl={fileUrl} filename={filename} />}
									{fileTypeInfo.category === "xlsx" && <XlsxPreview fileUrl={fileUrl} filename={filename} />}
									{(fileTypeInfo.category === "text" || fileTypeInfo.category === "code") && (
										<CodePreview fileUrl={fileUrl} filename={filename} category={fileTypeInfo.category} />
									)}
									{!fileTypeInfo.canPreview && (
										<UnsupportedPreview filename={filename} fileType={fileTypeInfo.category} />
									)}
								</>
							) : (
								<UnsupportedPreview filename={filename} fileType={fileTypeInfo.category} />
							)}
						</ScrollArea>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
