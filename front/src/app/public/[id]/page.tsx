"use client";

import { FileService, PublicFileMeta } from "bedrock-ts-sdk";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import PublicFileContent from "@/app/public/[id]/PublicFileContent";
import { dotsBackground } from "@/components/auth/background";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function Public() {
	const { id } = useParams<{ id: string }>();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [file, setFile] = useState<PublicFileMeta | null>(null);

	useEffect(() => {
		(async () => {
			const fetchedFile = await FileService.fetchPublicFileMeta(id);
			setIsLoading(false);
			setFile(fetchedFile);
		})();
	}, [id]);

	const handleDownload = useCallback(async () => {
		if (!file) return;

		try {
			const buffer = await FileService.downloadPublicFile(file.store_hash);
			const blob = new Blob([buffer], { type: "application/octet-stream" });
			const url = URL.createObjectURL(blob);

			const link = document.createElement("a");
			link.href = url;
			link.download = file.name || "downloaded-file";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			toast.error("Failed to download file:" + error?.toString());
		}
	}, [file]);

	const background = file ? "bg-gradient-to-br from-red-900 to-orange-800" : "bg-black";

	useEffect(() => {
		dotsBackground(canvasRef);
	}, []);

	return (
		<div className={`fixed inset-0 flex items-center justify-center ${background}`}>
			<canvas ref={canvasRef} className="absolute inset-0" style={{ mixBlendMode: "screen" }} />

			<Card className={`z-50 w-[40%] h-[${file ? "30%" : "20%"}] flex flex-col justify-between items-center`}>
				<CardHeader>
					<CardTitle>Bedrock Public File System</CardTitle>
				</CardHeader>
				<PublicFileContent isLoading={isLoading} onClick={handleDownload} file={file} />
			</Card>
		</div>
	);
}
