"use client";

interface VideoPreviewProps {
	fileUrl: string;
	mimeType: string;
}

export default function VideoPreview({ fileUrl, mimeType }: VideoPreviewProps) {
	return (
		<div className="flex items-center justify-center w-full">
			<video
				controls
				className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
				src={fileUrl}
			>
				<source src={fileUrl} type={mimeType} />
				Your browser does not support the video tag.
			</video>
		</div>
	);
}

