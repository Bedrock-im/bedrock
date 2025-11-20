"use client";

import { FileText } from "lucide-react";

import { FileCategory } from "@/utils/file-types";

interface UnsupportedPreviewProps {
	filename: string;
	fileType: FileCategory;
}

export default function UnsupportedPreview({ fileType }: UnsupportedPreviewProps) {
	return (
		<div className="flex flex-col items-center justify-center h-64 gap-4">
			<FileText className="h-16 w-16 text-muted-foreground" />
			<div className="text-center">
				<p className="text-lg font-medium mb-2">Preview not available</p>
				<p className="text-sm text-muted-foreground">This file type ({fileType}) cannot be previewed in the browser.</p>
				<p className="text-sm text-muted-foreground mt-2">Please download the file to view it.</p>
			</div>
		</div>
	);
}
