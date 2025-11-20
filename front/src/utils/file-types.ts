import {
	FileText,
	Image,
	File,
	Music,
	Video,
	FileSpreadsheet,
	Presentation,
	Archive,
	type LucideIcon,
} from "lucide-react";

export type FileCategory =
	| "image"
	| "video"
	| "audio"
	| "text"
	| "code"
	| "pdf"
	| "document"
	| "docx"
	| "spreadsheet"
	| "xlsx"
	| "presentation"
	| "archive"
	| "other";

export interface FileTypeInfo {
	category: FileCategory;
	mimeType: string;
	icon: LucideIcon;
	canPreview: boolean;
}

const imageExtensions = new Set([
	"jpg",
	"jpeg",
	"png",
	"gif",
	"webp",
	"svg",
	"bmp",
	"ico",
	"tiff",
	"tif",
	"avif",
	"heic",
	"heif",
]);

const videoExtensions = new Set([
	"mp4",
	"webm",
	"ogg",
	"mov",
	"avi",
	"wmv",
	"flv",
	"mkv",
	"m4v",
	"3gp",
	"3g2",
	"mpg",
	"mpeg",
	"m2v",
	"m4v",
]);

const audioExtensions = new Set(["mp3", "wav", "oga", "flac", "aac", "m4a", "wma", "opus", "webm"]);

const textExtensions = new Set([
	"txt",
	"md",
	"markdown",
	"rtf",
	"log",
	"csv",
	"tsv",
	"ini",
	"conf",
	"config",
	"yaml",
	"yml",
	"toml",
	"json",
	"xml",
	"html",
	"htm",
	"css",
	"scss",
	"sass",
	"less",
	"styl",
	"js",
	"jsx",
	"ts",
	"tsx",
	"py",
	"java",
	"cpp",
	"c",
	"cc",
	"cxx",
	"h",
	"hpp",
	"cs",
	"php",
	"rb",
	"go",
	"rs",
	"swift",
	"kt",
	"scala",
	"clj",
	"sh",
	"bash",
	"zsh",
	"fish",
	"ps1",
	"bat",
	"cmd",
	"vue",
	"svelte",
	"dart",
	"lua",
	"r",
	"m",
	"mm",
	"pl",
	"pm",
	"sql",
	"graphql",
	"gql",
	"",
]);

const spreadsheetExtensions = new Set(["xls", "xlsx", "ods", "csv", "tsv", "numbers"]);

const presentationExtensions = new Set(["ppt", "pptx", "odp", "key"]);

const archiveExtensions = new Set([
	"zip",
	"rar",
	"7z",
	"tar",
	"gz",
	"bz2",
	"xz",
	"lz",
	"lzma",
	"z",
	"cab",
	"iso",
	"dmg",
	"deb",
	"rpm",
	"pkg",
	"apk",
]);

export function getFileExtension(filename: string): string {
	const parts = filename.split(".");
	if (parts.length < 2) return "";
	return parts[parts.length - 1].toLowerCase();
}

export function getFileTypeInfo(filename: string): FileTypeInfo {
	const extension = getFileExtension(filename);

	if (imageExtensions.has(extension)) {
		return {
			category: "image",
			mimeType: getMimeType(extension),
			icon: Image,
			canPreview: true,
		};
	}

	if (videoExtensions.has(extension)) {
		return {
			category: "video",
			mimeType: getMimeType(extension),
			icon: Video,
			canPreview: true,
		};
	}

	if (audioExtensions.has(extension)) {
		return {
			category: "audio",
			mimeType: getMimeType(extension),
			icon: Music,
			canPreview: true,
		};
	}

	/*	if (codeExtensions.has(extension)) {
		return {
			category: "code",
			mimeType: getMimeType(extension),
			icon: FileCode,
			canPreview: true,
		};
	}*/

	if (textExtensions.has(extension)) {
		return {
			category: "text",
			mimeType: getMimeType(extension),
			icon: FileText,
			canPreview: true,
		};
	}

	if (extension === "pdf") {
		return {
			category: "pdf",
			mimeType: "application/pdf",
			icon: FileText,
			canPreview: true,
		};
	}

	if (extension === "docx") {
		return {
			category: "docx",
			mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			icon: FileText,
			canPreview: true,
		};
	}

	if (extension === "xlsx") {
		return {
			category: "xlsx",
			mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			icon: FileSpreadsheet,
			canPreview: true,
		};
	}

	if (spreadsheetExtensions.has(extension)) {
		return {
			category: "spreadsheet",
			mimeType: getMimeType(extension),
			icon: FileSpreadsheet,
			canPreview: false,
		};
	}

	if (presentationExtensions.has(extension)) {
		return {
			category: "presentation",
			mimeType: getMimeType(extension),
			icon: Presentation,
			canPreview: false,
		};
	}

	if (archiveExtensions.has(extension)) {
		return {
			category: "archive",
			mimeType: getMimeType(extension),
			icon: Archive,
			canPreview: false,
		};
	}

	return {
		category: "other",
		mimeType: "application/octet-stream",
		icon: File,
		canPreview: false,
	};
}

export function getMimeType(extension: string): string {
	const mimeTypes: Record<string, string> = {
		// Images
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		gif: "image/gif",
		webp: "image/webp",
		svg: "image/svg+xml",
		bmp: "image/bmp",
		ico: "image/x-icon",
		tiff: "image/tiff",
		tif: "image/tiff",
		avif: "image/avif",
		heic: "image/heic",
		heif: "image/heif",
		// Videos
		mp4: "video/mp4",
		webm: "video/webm",
		ogg: "video/ogg",
		mov: "video/quicktime",
		avi: "video/x-msvideo",
		wmv: "video/x-ms-wmv",
		flv: "video/x-flv",
		mkv: "video/x-matroska",
		// Audio
		mp3: "audio/mpeg",
		wav: "audio/wav",
		flac: "audio/flac",
		aac: "audio/aac",
		m4a: "audio/mp4",
		wma: "audio/x-ms-wma",
		opus: "audio/opus",
		// Documents
		pdf: "application/pdf",
		doc: "application/msword",
		docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		odt: "application/vnd.oasis.opendocument.text",
		rtf: "application/rtf",
		// Spreadsheets
		xls: "application/vnd.ms-excel",
		xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		ods: "application/vnd.oasis.opendocument.spreadsheet",
		csv: "text/csv",
		tsv: "text/tab-separated-values",
		// Presentations
		ppt: "application/vnd.ms-powerpoint",
		pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
		odp: "application/vnd.oasis.opendocument.presentation",
		// Archives
		zip: "application/zip",
		rar: "application/x-rar-compressed",
		"7z": "application/x-7z-compressed",
		tar: "application/x-tar",
		gz: "application/gzip",
		bz2: "application/x-bzip2",
		xz: "application/x-xz",
		// Text
		txt: "text/plain",
		md: "text/markdown",
		markdown: "text/markdown",
		html: "text/html",
		htm: "text/html",
		css: "text/css",
		js: "text/javascript",
		json: "application/json",
		xml: "application/xml",
		yaml: "text/yaml",
		yml: "text/yaml",
	};

	return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
}
