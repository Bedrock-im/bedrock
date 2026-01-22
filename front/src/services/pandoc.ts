export type PandocAction = "to-markdown" | "from-markdown";

export interface PandocConversionResult {
	content: Blob;
	filename: string;
}

export async function convertToMarkdown(file: File): Promise<string> {
	const markdownBlob = await convertFile(file, "md");
	return await markdownBlob.text();
}

export async function convertFile(file: File, outputFormat: string): Promise<Blob> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("outputFormat", outputFormat);
 
    const response = await fetch("/api/pandoc", {
       method: "POST",
       body: formData,
    });
 
    if (!response.ok) {
       const data = await response.json().catch(() => ({}));
       throw new Error(data.error || `Conversion failed: ${response.statusText}`);
    }
 
    return await response.blob();
 }

export async function convertFromMarkdown(
	markdownContent: string,
	originalFilename: string,
	originalFileType?: string,
): Promise<Blob> {
	const markdownBlob = new Blob([markdownContent], { type: "text/markdown" });
	const markdownFile = new File([markdownBlob], "content.md", { type: "text/markdown" });

	let extension = getFileExtension(originalFilename);
	
	// If no extension found, try to infer from MIME type
	if (!extension && originalFileType) {
		const mimeToExt: Record<string, string> = {
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
			"application/msword": "doc",
			"application/vnd.oasis.opendocument.text": "odt",
			"application/rtf": "rtf",
			"text/html": "html",
			"text/htm": "html",
			"application/pdf": "pdf",
			"application/epub+zip": "epub",
			"application/x-tex": "tex",
			"application/x-latex": "latex",
			"application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
			"application/vnd.ms-powerpoint": "ppt",
			"application/vnd.oasis.opendocument.presentation": "odp",
		};
		extension = mimeToExt[originalFileType];
	}
	
	if (!extension) {
		throw new Error(`Cannot determine output format from filename: "${originalFilename}". Please ensure the file has a valid extension (e.g., .docx, .odt, .rtf).`);
	}

	return await convertFile(markdownFile, extension);
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



