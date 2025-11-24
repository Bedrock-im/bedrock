"use client";

import mammoth from "mammoth";
import { useEffect, useState } from "react";

interface DocxPreviewProps {
	fileUrl: string;
	filename: string;
}

export default function DocxPreview({ fileUrl }: DocxPreviewProps) {
	const [htmlContent, setHtmlContent] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setIsLoading(true);
		setError(null);

		fetch(fileUrl)
			.then((response) => {
				if (!response.ok) {
					throw new Error("Failed to load file");
				}
				return response.arrayBuffer();
			})
			.then((arrayBuffer) => {
				return mammoth.convertToHtml({ arrayBuffer });
			})
			.then((result) => {
				setHtmlContent(result.value);
				setIsLoading(false);
			})
			.catch((err) => {
				console.error("Failed to convert DOCX:", err);
				setError(err instanceof Error ? err.message : "Failed to convert DOCX file");
				setIsLoading(false);
			});
	}, [fileUrl]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<p className="text-muted-foreground">Converting DOCX to HTML...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<p className="text-destructive font-medium">Error converting DOCX</p>
					<p className="text-sm text-muted-foreground mt-2">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full">
			<div
				className="prose prose-sm max-w-none bg-white p-8 rounded-lg shadow-lg border"
				dangerouslySetInnerHTML={{ __html: htmlContent }}
			/>
		</div>
	);
}
