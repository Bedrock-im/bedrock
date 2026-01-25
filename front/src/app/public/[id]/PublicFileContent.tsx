import { PublicFileMeta } from "bedrock-ts-sdk";
import { filesize } from "filesize";
import { DownloadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";

interface PublicFileContentProps {
	isLoading: boolean;
	onClick: () => void;
	file: PublicFileMeta | null;
}

export default function PublicFileContent({ isLoading, onClick, file }: PublicFileContentProps) {
	if (isLoading) {
		return <CardContent>Your file is loading...</CardContent>;
	} else if (file) {
		return (
			<CardContent className="flex flex-col items-center gap-8">
				<div className="flex flex-col items-center gap-4">
					<div className="flex items-center">
						<p className="font-bold">{file.username}</p>&nbsp;shared a file with you.
					</div>
					<div className="flex items-center">
						<p className="font-bold">{file.name}</p>&nbsp;- {filesize(file.size)}
					</div>
				</div>
				<Button variant="secondary" className="gap-2" onClick={onClick}>
					<DownloadCloud size={16} />
					Download
				</Button>
			</CardContent>
		);
	} else {
		return <CardContent>Sorry, you entered an invalid link.</CardContent>;
	}
}
