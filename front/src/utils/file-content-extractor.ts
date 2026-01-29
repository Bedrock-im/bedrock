import type { TextItem } from "pdfjs-dist/types/src/display/api";

export const supportedTextFiles = [
	"txt",
	"md",
	"markdown",
	"html",
	"htm",
	"cpp",
	"go",
	"java",
	"js",
	"ts",
	"php",
	"proto",
	"py",
	"rst",
	"rb",
	"rs",
	"scala",
	"swift",
	"sol",
	"json",
	"xml",
	"yaml",
	"yml",
	"css",
	"scss",
	"less",
	"sh",
	"bash",
	"zsh",
];

const extractTextFromPdfBuffer = async (buffer: Buffer): Promise<string> => {
	try {
		const pdfjs = await import("pdfjs-dist");
		pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

		const uint8Array = new Uint8Array(buffer);
		const pdf = await pdfjs.getDocument({ data: uint8Array }).promise;
		const maxPages = pdf.numPages;
		const textContent: string[] = [];

		for (let i = 1; i <= maxPages; i++) {
			const page = await pdf.getPage(i);
			const content = await page.getTextContent();
			const pageTextContent = content.items.map((item) => (item as TextItem).str).join(" ");
			textContent.push(pageTextContent);
		}

		return textContent.join("\n\n");
	} catch (error) {
		console.error("Failed to extract text from PDF buffer:", error);
		throw new Error(
			"Failed to extract text from PDF file. The file may be corrupted, unsupported, or too large to process.",
		);
	}
};

export const extractFileContent = async (filePath: string, content: Buffer): Promise<string> => {
	const fileExt = filePath.split(".").pop()?.toLowerCase() ?? "";

	if (fileExt === "pdf") {
		return extractTextFromPdfBuffer(content);
	}

	// For text-based files, convert buffer to string
	if (supportedTextFiles.includes(fileExt)) {
		return Buffer.from(content).toString("utf-8");
	}

	// Fallback: try to convert as text
	return Buffer.from(content).toString("utf-8");
};

export const isPdfFile = (filePath: string): boolean => {
	return filePath.toLowerCase().endsWith(".pdf");
};
