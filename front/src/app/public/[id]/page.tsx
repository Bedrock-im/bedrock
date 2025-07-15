"use client";

import { filesize } from "filesize";
import { DownloadCloud } from "lucide-react";
import { useEffect, useRef } from "react";

import { dotsBackground } from "@/components/auth/background";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileFullInfos } from "@/services/bedrock";

interface PublicPageProps {
	params: {
		id: string;
	};
}

function getFile(_id: string): Pick<FileFullInfos, "name" | "size"> | null {
	return null;
}

export default function Public(props: PublicPageProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// TODO: Add logic to fetch and validate the post ID
	const file: Pick<FileFullInfos, "name" | "size"> | null = getFile(props.params.id);
	// TODO: Fetch username from address
	const username = "luxus.io";

	const background = file ? "bg-gradient-to-br from-red-900 to-orange-900" : "bg-black";

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
				{file ? (
					<CardContent className="flex flex-col items-center gap-8">
						<div className="flex flex-col items-center gap-4">
							<div className="flex items-center">
								<p className="font-bold">{username}</p>&nbsp;shared a file with you.
							</div>
							<div className="flex items-center">
								<p className="font-bold">{file.name}</p>&nbsp;- {filesize(file.size)}
							</div>
						</div>
						<Button variant="secondary">
							<DownloadCloud size={16} />
							Download
						</Button>
					</CardContent>
				) : (
					<CardContent>Sorry, you entered an invalid link.</CardContent>
				)}
			</Card>
		</div>
	);
}
