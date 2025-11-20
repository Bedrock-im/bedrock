"use client";

import CodePreview from "./CodePreview";

interface TextPreviewProps {
	fileUrl: string;
	filename: string;
}

export default function TextPreview({ fileUrl, filename }: TextPreviewProps) {
	return <CodePreview fileUrl={fileUrl} filename={filename} category="text" />;
}
