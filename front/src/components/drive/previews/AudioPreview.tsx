"use client";

interface AudioPreviewProps {
	fileUrl: string;
	mimeType: string;
	filename: string;
}

export default function AudioPreview({ fileUrl, mimeType, filename }: AudioPreviewProps) {
	return (
		<div className="flex flex-col items-center justify-center w-full py-8">
			<div className="w-full max-w-md">
				<p className="text-center text-sm text-muted-foreground mb-4">{filename}</p>
				<audio controls className="w-full" src={fileUrl}>
					<source src={fileUrl} type={mimeType} />
					Your browser does not support the audio tag.
				</audio>
			</div>
		</div>
	);
}
