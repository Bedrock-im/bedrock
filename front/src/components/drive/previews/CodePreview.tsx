"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CodePreviewProps {
	fileUrl: string;
	filename: string;
	category: "text" | "code";
	onSave?: (newFile: File) => Promise<void>;
}

export default function CodePreview({ fileUrl, filename, category, onSave }: CodePreviewProps) {
	const [content, setContent] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (viewMode === "preview") {
			setIsLoading(true);
			setError(null);

			fetch(fileUrl)
				.then((response) => {
					if (!response.ok) {
						throw new Error("Failed to load file");
					}
					return response.text();
				})
				.then((text) => {
					setContent(text);
					setIsLoading(false);
				})
				.catch((err) => {
					setError(err instanceof Error ? err.message : "Failed to load file");
					setIsLoading(false);
				});
		}
	}, [fileUrl, viewMode]);

	const handleEditClick = () => {
		setViewMode("edit");
	};

	const handleSave = async () => {
		if (!onSave) return;

		setIsSaving(true);
		try {
			const blob = new Blob([content], { type: "text/plain" });
			const file = new File([blob], filename, { type: "text/plain" });
			await onSave(file);
			setViewMode("preview");
			toast.success("File saved successfully");
		} catch (e) {
			console.error(e);
			toast.error("Failed to save changes");
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading && viewMode === "preview") {
		return (
			<div className="flex flex-col gap-4 w-full h-full max-w-4xl mx-auto">
				<div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-blue-100 rounded-md">
							<FileText className="h-5 w-5 text-blue-600" />
						</div>
						<div>
							<h3 className="font-medium text-sm">{filename}</h3>
							<p className="text-xs text-muted-foreground">Read-only Preview</p>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-center h-64">
					<p className="text-muted-foreground">Loading content...</p>
				</div>
			</div>
		);
	}

	if (error && viewMode === "preview") {
		return (
			<div className="flex flex-col gap-4 w-full h-full max-w-4xl mx-auto">
				<div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-blue-100 rounded-md">
							<FileText className="h-5 w-5 text-blue-600" />
						</div>
						<div>
							<h3 className="font-medium text-sm">{filename}</h3>
							<p className="text-xs text-muted-foreground">Read-only Preview</p>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-center h-64">
					<p className="text-destructive">{error}</p>
				</div>
			</div>
		);
	}

	const isCodeFile = category === "code";
	const extension = filename.split(".").pop()?.toLowerCase() || "";

	return (
		<div className="flex flex-col gap-4 w-full h-full max-w-4xl mx-auto">
			<div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-blue-100 rounded-md">
						<FileText className="h-5 w-5 text-blue-600" />
					</div>
					<div>
						<h3 className="font-medium text-sm">{filename}</h3>
						<p className="text-xs text-muted-foreground">{viewMode === "preview" ? "Read-only Preview" : "Editor"}</p>
					</div>
				</div>

				<div className="flex gap-2">
					{viewMode === "preview" ? (
						onSave && (
							<Button onClick={handleEditClick}>
								<Pencil className="mr-2 h-4 w-4" />
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

			<div className="flex-1 min-h-[500px] border rounded-lg shadow-sm bg-white overflow-hidden">
				{viewMode === "preview" ? (
					<pre
						className={`bg-slate-950 text-slate-50 p-4 rounded-lg text-sm font-mono whitespace-pre h-full overflow-auto ${
							isCodeFile ? "language-" + extension : ""
						}`}
					>
						<code className="block">{content}</code>
					</pre>
				) : (
					<Textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						className="w-full h-full min-h-[600px] p-6 font-mono text-sm resize-none border-0 focus-visible:ring-0"
						placeholder="Edit file content..."
					/>
				)}
			</div>
		</div>
	);
}
