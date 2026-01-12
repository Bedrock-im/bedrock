"use client";

import { useState, useEffect } from "react";
import { Save, X, Loader2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { convertToMarkdown, convertFromMarkdown } from "@/services/pandoc";
import { toast } from "sonner";

interface EditablePandocPreviewProps {
	file: File;
	filename: string;
	onSave: (file: File) => Promise<void>;
	onCancel: () => void;
}

export default function EditablePandocPreview({
	file,
	filename,
	onSave,
	onCancel,
}: EditablePandocPreviewProps) {
	const [markdownContent, setMarkdownContent] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadAndConvert();
	}, [file]);

	const loadAndConvert = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const markdown = await convertToMarkdown(file);
			setMarkdownContent(markdown);
		} catch (err) {
			console.error("Failed to convert to markdown:", err);
			setError(err instanceof Error ? err.message : "Failed to convert file to markdown");
			toast.error("Failed to convert file to markdown");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSave = async () => {
		setIsSaving(true);
		setError(null);
		try {
			// Convert markdown back to original format
			const convertedBlob = await convertFromMarkdown(markdownContent, filename);

			// Create a new File object with the converted content
			const convertedFile = new File([convertedBlob], filename, {
				type: file.type,
			});

			await onSave(convertedFile);
			toast.success("File saved successfully");
		} catch (err) {
			console.error("Failed to save:", err);
			const errorMessage = err instanceof Error ? err.message : "Failed to save file";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
				<p className="text-muted-foreground">Converting to markdown...</p>
			</div>
		);
	}

	if (error && !markdownContent) {
		return (
			<div className="flex flex-col items-center justify-center h-64">
				<div className="text-center">
					<p className="text-destructive font-medium mb-2">Error loading file</p>
					<p className="text-sm text-muted-foreground mb-4">{error}</p>
					<Button variant="outline" size="sm" onClick={onCancel}>
						<X className="h-4 w-4 mr-2" />
						Close
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full flex flex-col h-full">
			<div className="flex justify-between items-center mb-4 flex-shrink-0">
				<div className="flex items-center gap-2">
					<Edit className="h-4 w-4 text-muted-foreground" />
					<p className="text-sm text-muted-foreground">Editing as Markdown</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
						<X className="h-4 w-4 mr-2" />
						Cancel
					</Button>
					<Button size="sm" onClick={handleSave} disabled={isSaving}>
						{isSaving ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Saving...
							</>
						) : (
							<>
								<Save className="h-4 w-4 mr-2" />
								Save
							</>
						)}
					</Button>
				</div>
			</div>
			{error && (
				<div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
					<p className="text-sm text-destructive">{error}</p>
				</div>
			)}
			<Textarea
				value={markdownContent}
				onChange={(e) => setMarkdownContent(e.target.value)}
				className="flex-1 min-h-[500px] font-mono text-sm resize-none"
				placeholder="Edit markdown content..."
			/>
		</div>
	);
}



