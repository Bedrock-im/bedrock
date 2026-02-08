import { Archive, File, FileSpreadsheet, FileText, Image, Music, Video } from "lucide-react";

import { getFileExtension, getFileTypeInfo, getMimeType, isFileEditable } from "../file-types";

describe("File Types Utils", () => {
	describe("getFileExtension", () => {
		it("should return the extension of a filename", () => {
			expect(getFileExtension("image.png")).toBe("png");
			expect(getFileExtension("archive.tar.gz")).toBe("gz");
		});

		it("should return correct extension even in uppercase", () => {
			expect(getFileExtension("IMAGE.PNG")).toBe("png");
		});

		it("should return empty string if no extension", () => {
			expect(getFileExtension("makefile")).toBe("");
		});

		it("should handle filenames with multiple dots", () => {
			expect(getFileExtension("my.file.name.txt")).toBe("txt");
		});
	});

	describe("getMimeType", () => {
		it("should return correct mime type for common extensions", () => {
			expect(getMimeType("png")).toBe("image/png");
			expect(getMimeType("jpg")).toBe("image/jpeg");
			expect(getMimeType("pdf")).toBe("application/pdf");
			expect(getMimeType("json")).toBe("application/json");
			expect(getMimeType("mp4")).toBe("video/mp4");
		});

		it("should return default mime type for unknown extensions", () => {
			expect(getMimeType("unknown")).toBe("application/octet-stream");
		});

		it("should be case insensitive", () => {
			expect(getMimeType("PNG")).toBe("image/png");
		});
	});

	describe("getFileTypeInfo", () => {
		// Helper to check just the partial object since we can't easily compare Lucide icons by value equality sometimes,
		// but typically we can check reference if it's the exact same import.
		// If exact match fails, we can check properties.

		it("should detect images", () => {
			const info = getFileTypeInfo("photo.jpg");
			expect(info.category).toBe("image");
			expect(info.canPreview).toBe(true);
			expect(info.icon).toBe(Image);
			expect(info.mimeType).toBe("image/jpeg");
		});

		it("should detect videos", () => {
			const info = getFileTypeInfo("movie.mp4");
			expect(info.category).toBe("video");
			expect(info.canPreview).toBe(true);
			expect(info.icon).toBe(Video);
			expect(info.mimeType).toBe("video/mp4");
		});

		it("should detect audio", () => {
			const info = getFileTypeInfo("song.mp3");
			expect(info.category).toBe("audio");
			expect(info.canPreview).toBe(true);
			expect(info.icon).toBe(Music);
			expect(info.mimeType).toBe("audio/mpeg");
		});

		it("should detect text files", () => {
			const info = getFileTypeInfo("readme.md");
			expect(info.category).toBe("text");
			expect(info.canPreview).toBe(true);
			expect(info.icon).toBe(FileText);
			expect(info.mimeType).toBe("text/markdown");
		});

		it("should detect pdf", () => {
			const info = getFileTypeInfo("doc.pdf");
			expect(info.category).toBe("pdf");
			expect(info.canPreview).toBe(true);
			expect(info.icon).toBe(FileText);
			expect(info.mimeType).toBe("application/pdf");
		});

		it("should detect docx", () => {
			const info = getFileTypeInfo("doc.docx");
			expect(info.category).toBe("docx");
			expect(info.canPreview).toBe(true);
			expect(info.icon).toBe(FileText);
		});

		it("should detect xlsx", () => {
			const info = getFileTypeInfo("sheet.xlsx");
			expect(info.category).toBe("xlsx");
			expect(info.canPreview).toBe(true);
			expect(info.icon).toBe(FileSpreadsheet);
		});

		it("should detect archives", () => {
			const info = getFileTypeInfo("backup.zip");
			expect(info.category).toBe("archive");
			expect(info.canPreview).toBe(false);
			expect(info.icon).toBe(Archive);
		});

		it("should default to other for unknown types", () => {
			const info = getFileTypeInfo("unknown.xyz");
			expect(info.category).toBe("other");
			expect(info.canPreview).toBe(false);
			expect(info.icon).toBe(File);
		});
	});

	describe("isFileEditable", () => {
		it("should return true for text files", () => {
			expect(isFileEditable("file.txt")).toBe(true);
			expect(isFileEditable("script.js")).toBe(true);
			expect(isFileEditable("readme.md")).toBe(true);
		});

		it("should return true for docx and odt", () => {
			expect(isFileEditable("doc.docx")).toBe(true);
			expect(isFileEditable("doc.odt")).toBe(true);
		});

		it("should return false for binary files (images, pdfs, etc)", () => {
			expect(isFileEditable("image.png")).toBe(false);
			expect(isFileEditable("doc.pdf")).toBe(false);
			expect(isFileEditable("archive.zip")).toBe(false);
		});
	});
});
