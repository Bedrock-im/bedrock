"use client";

import { FileText, Loader2, Pencil, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { convertFile } from "@/services/pandoc";

interface PDFPreviewProps {
	fileUrl: string;
	filename?: string;
	onSave?: (newFile: File) => Promise<void>;
}

export default function PDFPreview({ fileUrl, filename, onSave }: Readonly<PDFPreviewProps>) {
	const [currentFile, setCurrentFile] = useState<File | null>(null);
	const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");

	const [markdownContent, setMarkdownContent] = useState<string>("");

	const [isLoadingFile, setIsLoadingFile] = useState(true);
	const [isConverting, setIsConverting] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		const init = async () => {
			try {
				setIsLoadingFile(true);
				const res = await fetch(fileUrl);
				if (!res.ok) throw new Error("Failed to fetch file");

				const blob = await res.blob();
				const file = new File([blob], filename || "document.pdf", { type: blob.type });
				setCurrentFile(file);
			} catch (error) {
				toast.error("Failed to load document");
				console.error(error);
			} finally {
				setIsLoadingFile(false);
			}
		};

		init();
	}, [fileUrl, filename]);

	const handleEditClick = async () => {
		if (!currentFile) return;

		setIsConverting(true);
		try {
			const mdBlob = await convertFile(currentFile, "md");
			const mdText = await mdBlob.text();
			setMarkdownContent(mdText);
			setViewMode("edit");
		} catch (e) {
			console.error(e);
			toast.error("Could not switch to edit mode");
		} finally {
			setIsConverting(false);
		}
	};

	const handleSave = async () => {
		setIsSaving(true);
		try {
			const markdownBlob = new Blob([markdownContent], { type: "text/markdown" });
			const markdownFile = new File([markdownBlob], "source.md");

			const originalExt = filename?.split(".").pop() || "pdf";
			const newPdfBlob = await convertFile(markdownFile, originalExt);
			const newPdfFile = new File([newPdfBlob], filename || "document.pdf", {
				type: "application/pdf",
			});

			setCurrentFile(newPdfFile);

			if (onSave) await onSave(newPdfFile);

			setViewMode("preview");
			toast.success("File saved successfully");
		} catch (e) {
			console.error(e);
			toast.error("Failed to save changes");
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoadingFile) {
		return (
			<div className="flex h-64 w-full items-center justify-center border rounded-lg bg-slate-50">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
				<span className="text-muted-foreground">Loading document...</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
			<div className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm flex-shrink-0">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-blue-100 rounded-md">
						<FileText className="h-5 w-5 text-blue-600" />
					</div>
					<div>
						<h3 className="font-medium text-sm">{filename || "PDF Document"}</h3>
						<p className="text-xs text-muted-foreground">
							{viewMode === "preview" ? "Read-only Preview" : "Markdown Editor"}
						</p>
					</div>
				</div>

				<div className="flex gap-2">
					{viewMode === "preview" ? (
						onSave && (
							<Button onClick={handleEditClick} disabled={isConverting}>
								{isConverting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pencil className="mr-2 h-4 w-4" />}
								Edit Document
							</Button>
						)
					) : (
						<>
							<Button variant="ghost" onClick={() => setViewMode("preview")} disabled={isSaving}>
								Cancel
							</Button>
							<Button onClick={handleSave} disabled={isSaving}>
								{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
								Save Changes
							</Button>
						</>
					)}
				</div>
			</div>

			<div className="h-[calc(90vh-200px)] border rounded-lg shadow-sm bg-card overflow-hidden">
				{viewMode === "preview" ? (
					<iframe src={fileUrl} className="w-full h-full rounded-lg border-0" title="PDF Preview" />
				) : (
					<Textarea
						value={markdownContent}
						onChange={(e) => setMarkdownContent(e.target.value)}
						className="w-full h-full p-6 font-mono text-sm resize-none border-0 focus-visible:ring-0"
						placeholder="# Start typing..."
					/>
				)}
			</div>
		</div>
	);
}
