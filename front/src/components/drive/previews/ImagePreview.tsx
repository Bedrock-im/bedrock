"use client";

import { useState } from "react";

interface ImagePreviewProps {
	fileUrl: string;
	filename: string;
}

export default function ImagePreview({ fileUrl, filename }: ImagePreviewProps) {
	const [imageError, setImageError] = useState(false);

	if (imageError) {
		return (
			<div className="flex items-center justify-center h-64">
				<p className="text-muted-foreground">Failed to load image</p>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center w-full">
			<img
				src={fileUrl}
				alt={filename}
				className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
				onError={() => setImageError(true)}
			/>
		</div>
	);
}

