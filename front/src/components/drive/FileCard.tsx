import { ArchiveRestore, Edit, FileDown, FileText, FolderIcon, Move, Trash } from "lucide-react";
import React from "react";

import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { DriveFile, DriveFolder } from "@/stores/drive";

export type FileCardProps = {
	selected?: boolean;
	onLeftClick?: () => void;
	onDoubleClick?: () => void;
	onDelete?: () => void;
	onRename?: () => void;
	onMove?: () => void;
	onDownload?: () => void;
} & (FileCardFileProps | FileCardFolderProps);

type FileCardFileProps = {
	folder?: false;
	onRestore?: () => void;
	restoreButton?: boolean;
	metadata: DriveFile;
};

type FileCardFolderProps = {
	folder: true;
	metadata: DriveFolder;
};

const FileCard = (props: FileCardProps) => {
	const {
		folder,
		selected = false,
		onLeftClick,
		onDoubleClick,
		onDelete,
		onMove,
		onRename,
		onDownload,
		metadata,
	} = props;
	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<Card
					className={`grid grid-cols-4 gap-3 p-2.5 mb-1.5 hover:bg-gray-100 hover:shadow-lg transition ${selected ? "selected" : ""}`}
					onClick={() => onLeftClick?.()}
					onDoubleClick={() => onDoubleClick?.()}
				>
					<CardTitle className="flex items-center">
						{folder ? (
							<FolderIcon className={`${metadata.deleted_at ? "text-red-400" : "text-blue-600"}`} />
						) : (
							<FileText className={`${metadata.deleted_at ? "text-red-400" : "text-blue-600"}`} />
						)}
						<span>{metadata.path.split("/").pop()}</span>
					</CardTitle>
					{folder ? (
						<>
							<CardContent>-</CardContent>
							<CardContent>-</CardContent>
						</>
					) : (
						<>
							<CardContent>{metadata.size} KB</CardContent>
							<CardContent>{new Date(metadata.created_at).toLocaleString()}</CardContent>
						</>
					)}
					<CardFooter>Owner</CardFooter>
				</Card>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuLabel>Actions</ContextMenuLabel>
				<ContextMenuSeparator />
				<ContextMenuItem className="flex space-x-4" onClick={() => onDelete?.()}>
					<Trash />
					<ContextMenuLabel>Delete</ContextMenuLabel>
				</ContextMenuItem>
				<ContextMenuItem className="flex space-x-4" onClick={() => onRename?.()}>
					<Edit />
					<ContextMenuLabel>Rename</ContextMenuLabel>
				</ContextMenuItem>
				<ContextMenuItem className="flex space-x-4" onClick={() => onMove?.()}>
					<Move />
					<ContextMenuLabel>Move</ContextMenuLabel>
				</ContextMenuItem>
				<ContextMenuItem className="flex space-x-4" onClick={() => onDownload?.()}>
					<FileDown />
					<ContextMenuLabel>Download</ContextMenuLabel>
				</ContextMenuItem>
				{!props.folder && props.restoreButton && (
					<ContextMenuItem className="flex space-x-4" onClick={() => props.onRestore?.()}>
						<ArchiveRestore />
						<ContextMenuLabel>Restore</ContextMenuLabel>
					</ContextMenuItem>
				)}
			</ContextMenuContent>
		</ContextMenu>
	);
};

export default FileCard;
