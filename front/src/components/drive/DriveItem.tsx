import { FileText, FolderIcon } from "lucide-react";
import React, { useMemo } from "react";

import { DriveMenu } from "@/components/drive/DriveMenu";
import { Card, CardContent } from "@/components/ui/card";
import { DriveFile, DriveFolder } from "@/stores/drive";

interface DriveItemProps {
	type: "file" | "folder";
	isSelected: boolean;
	onClick?: () => void;
	file: DriveFile | DriveFolder;
	size?: number;
}

export const DriveItem = ({ type, isSelected, onClick, file, size }: DriveItemProps) => {
	const sizeFormat = useMemo(() => {
		if (!size) return null;

		const units = ["B", "KB", "MB", "GB"];
		let finalSize = size;
		let unitIndex = 0;

		while (finalSize >= 1024 && unitIndex < units.length) {
			finalSize /= 1024;
			unitIndex += 1;
		}
		return `${finalSize.toFixed(2)} ${units[unitIndex]}`;
	}, [size]);

	return (
		<DriveMenu>
			<Card
				className={`grid grid-cols-4 py-4 mb-1 hover:bg-gray-100 hover:shadow-lg transition ${isSelected ? "selected" : ""}`}
				onClick={onClick}
			>
				<CardContent className="flex py-0 items-center gap-x-2">
					{type === "folder" ? <FolderIcon className="folder-icon" /> : <FileText className="file-icon" />}
					<span>-</span>
				</CardContent>
				<CardContent className="flex py-0 items-center">{sizeFormat}</CardContent>
				<CardContent className="flex py-0 items-center">{file.created_at}</CardContent>
				<CardContent className="flex py-0 items-center">-</CardContent>
			</Card>
		</DriveMenu>
	);
};
