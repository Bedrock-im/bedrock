"use client";

interface PDFPreviewProps {
	fileUrl: string;
}

export default function PDFPreview({ fileUrl }: PDFPreviewProps) {
	return (
		<div className="flex items-center justify-center w-full h-full min-h-[600px]">
			<iframe
				src={fileUrl}
				className="w-full h-[80vh] rounded-lg border shadow-lg"
				title="PDF Preview"
			/>
		</div>
	);
}

