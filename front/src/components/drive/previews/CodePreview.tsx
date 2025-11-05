"use client";

import { useEffect, useState } from "react";

interface CodePreviewProps {
	fileUrl: string;
	filename: string;
	category: "text" | "code";
}

export default function CodePreview({ fileUrl, filename, category }: CodePreviewProps) {
	const [content, setContent] = useState<string>("");
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
	}, [fileUrl]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<p className="text-muted-foreground">Loading content...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<p className="text-destructive">{error}</p>
			</div>
		);
	}

	const isCodeFile = category === "code";
	const extension = filename.split(".").pop()?.toLowerCase() || "";

	return (
		<div className="w-full">
			<pre
				className={`bg-slate-950 text-slate-50 p-4 rounded-lg text-sm font-mono whitespace-pre ${
					isCodeFile ? "language-" + extension : ""
				}`}
			>
				<code className="block">{content}</code>
			</pre>
		</div>
	);
}

