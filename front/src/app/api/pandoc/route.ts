import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink, readFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;
		const action = formData.get("action") as string; // "to-markdown" or "from-markdown"
		const targetFormat = formData.get("targetFormat") as string; // original file extension

		if (!file || !action) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const tempDir = tmpdir();
		const inputExt = action === "to-markdown" ? getFileExtension(file.name) : "md";
		const outputExt = action === "to-markdown" ? "md" : targetFormat || getFileExtension(file.name);
		const inputFile = join(tempDir, `input-${Date.now()}.${inputExt}`);
		const outputFile = join(tempDir, `output-${Date.now()}.${outputExt}`);

		try {
			await writeFile(inputFile, buffer);
			let command: string;
			if (action === "to-markdown") {
				command = `pandoc "${inputFile}" -t markdown -o "${outputFile}"`;
			} else {
				command = `pandoc "${inputFile}" -f markdown -t ${getPandocFormat(outputExt)} -o "${outputFile}"`;
			}
			try {
				await execAsync(command, { timeout: 30000 }); // 30 second timeout
			} catch (execError: any) {
				// Check if pandoc is not found
				if (execError.code === 127 || execError.message?.includes("pandoc: not found")) {
					throw new Error("Pandoc is not installed on the server. Please install pandoc to use this feature.");
				}
				throw execError;
			}
			const outputBuffer = await readFile(outputFile);
			await unlink(inputFile).catch(() => {});
			await unlink(outputFile).catch(() => {});
			return new NextResponse(outputBuffer, {
				headers: {
					"Content-Type": action === "to-markdown" ? "text/markdown" : getMimeType(outputExt),
					"Content-Disposition": `attachment; filename="converted.${outputExt}"`,
				},
			});
		} catch (error) {
			// Clean up on error
			await unlink(inputFile).catch(() => {});
			await unlink(outputFile).catch(() => {});

			console.error("Pandoc conversion error:", error);
			return NextResponse.json(
				{ error: `Pandoc conversion failed: ${error instanceof Error ? error.message : String(error)}` },
				{ status: 500 },
			);
		}
	} catch (error) {
		console.error("API route error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 },
		);
	}
}

function getFileExtension(filename: string): string {
	const parts = filename.split(".");
	if (parts.length < 2) return "";
	return parts[parts.length - 1].toLowerCase();
}

function getPandocFormat(extension: string): string {
	const formatMap: Record<string, string> = {
		docx: "docx",
		doc: "docx",
		odt: "odt",
		rtf: "rtf",
		html: "html",
		htm: "html",
		pdf: "pdf",
		epub: "epub",
		tex: "latex",
		latex: "latex",
		pptx: "pptx",
		ppt: "pptx",
		odp: "odp",
	};

	return formatMap[extension.toLowerCase()] || extension.toLowerCase();
}

function getMimeType(extension: string): string {
	const mimeTypes: Record<string, string> = {
		docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		doc: "application/msword",
		odt: "application/vnd.oasis.opendocument.text",
		rtf: "application/rtf",
		html: "text/html",
		htm: "text/html",
		pdf: "application/pdf",
		epub: "application/epub+zip",
		tex: "application/x-tex",
		latex: "application/x-latex",
		pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
		ppt: "application/vnd.ms-powerpoint",
		odp: "application/vnd.oasis.opendocument.presentation",
		md: "text/markdown",
	};

	return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
}

