import { exec } from "child_process";
import { writeFile, unlink, readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
	const tempFiles: string[] = [];

	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;
		const outputFormat = formData.get("outputFormat") as string;

		if (!file || !outputFormat) {
			return NextResponse.json({ error: "Missing file or outputFormat" }, { status: 400 });
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const tempDir = tmpdir();

		const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
		const inputExt = getFileExtension(safeName);

		if (!inputExt) {
			return NextResponse.json({ error: "Cannot determine input file format from filename" }, { status: 400 });
		}

		const inputFile = join(tempDir, `input-${Date.now()}.${inputExt}`);
		const outputFile = join(tempDir, `output-${Date.now()}.${outputFormat}`);

		tempFiles.push(inputFile, outputFile);
		await writeFile(inputFile, buffer);

		let command = `pandoc "${inputFile}" -o "${outputFile}"`;

		// Determine input format from file extension
		const isInputMarkdown = inputExt === "md" || inputExt === "markdown";

		if (outputFormat === "html") {
			// Embed images for HTML preview so they don't break
			command += ` --standalone --embed-resources`;
			if (isInputMarkdown) {
				command += ` -f markdown`;
			}
		} else if (outputFormat === "md" || outputFormat === "markdown") {
			// Converting TO markdown - specify markdown output format
			command += ` -t markdown_strict+pipe_tables+backtick_code_blocks --wrap=none`;
		} else {
			// Converting FROM markdown TO other formats (docx, odt, etc.)
			if (isInputMarkdown) {
				command += ` -f markdown`;
			}
			// Pandoc will auto-detect input format if not markdown
		}

		try {
			await execAsync(command, { timeout: 30000 });
		} catch (execError: unknown) {
			console.error("Pandoc execution failed:", execError);
			throw new Error("Conversion failed");
		}

		const outputBuffer = await readFile(outputFile);

		return new NextResponse(outputBuffer, {
			headers: {
				"Content-Type": getMimeType(outputFormat),
				"Content-Disposition": `attachment; filename="converted.${outputFormat}"`,
			},
		});
	} catch (error) {
		console.error("API error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal Server Error" },
			{ status: 500 },
		);
	} finally {
		// Cleanup temp files
		await Promise.all(tempFiles.map((f) => unlink(f).catch(() => {})));
	}
}

function getFileExtension(filename: string): string {
	return filename.split(".").pop()?.toLowerCase() || "";
}

function getMimeType(extension: string): string {
	const map: Record<string, string> = {
		html: "text/html",
		md: "text/markdown",
		markdown: "text/markdown",
		odt: "application/vnd.oasis.opendocument.text",
		docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	};
	return map[extension] || "application/octet-stream";
}
