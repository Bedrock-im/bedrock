export type PandocAction = "to-markdown" | "from-markdown";

export interface PandocConversionResult {
	content: Blob;
	filename: string;
}

export async function convertToMarkdown(file: File): Promise<string> {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("action", "to-markdown");

	const response = await fetch("/api/pandoc", {
		method: "POST",
		body: formData,
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: "Unknown error" }));
		throw new Error(error.error || `Failed to convert to markdown: ${response.statusText}`);
	}

	return await response.text();
}

export async function convertFromMarkdown(
	markdownContent: string,
	originalFilename: string,
): Promise<Blob> {
	const formData = new FormData();
	const markdownBlob = new Blob([markdownContent], { type: "text/markdown" });
	const markdownFile = new File([markdownBlob], "content.md", { type: "text/markdown" });

	formData.append("file", markdownFile);
	formData.append("action", "from-markdown");

	const extension = getFileExtension(originalFilename);
	formData.append("targetFormat", extension);

	const response = await fetch("/api/pandoc", {
		method: "POST",
		body: formData,
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: "Unknown error" }));
		throw new Error(error.error || `Failed to convert from markdown: ${response.statusText}`);
	}

	return await response.blob();
}

export function canConvertWithPandoc(filename: string): boolean {
	const extension = getFileExtension(filename);
	const supportedFormats = new Set([
		"docx",
		"doc",
		"odt",
		"rtf",
		"html",
		"htm",
		"pdf",
		"epub",
		"tex",
		"latex",
		"pptx",
		"ppt",
		"odp",
		"md",
		"markdown",
        "",
	]);

	return supportedFormats.has(extension.toLowerCase());
}

function getFileExtension(filename: string): string {
	const parts = filename.split(".");
	if (parts.length < 2) return "";
	return parts[parts.length - 1].toLowerCase();
}



