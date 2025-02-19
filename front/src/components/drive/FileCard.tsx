import { filesize } from "filesize";
import { ArchiveRestore, Edit, FileDown, FileText, FolderIcon, Move, Trash } from "lucide-react";
import React from "react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { DriveFile, DriveFolder } from "@/stores/drive";

export type FileCardProps = {
	selected?: boolean;
	onLeftClick?: () => void;
	onDelete?: () => void;
	onRename?: () => void;
	onMove?: () => void;
	onDownload?: () => void;
	onHardDelete?: () => void;
	onRestore?: () => void;
} & (FileCardFileProps | FileCardFolderProps);

type FileCardFileProps = {
	folder?: false;
	metadata: DriveFile;
};

type FileCardFolderProps = {
	folder: true;
	metadata: DriveFolder;
};

const FileCard = ({
	folder,
	selected = false,
	onLeftClick,
	onDelete,
	onMove,
	onRename,
	onDownload,
	onRestore,
	metadata,
}: FileCardProps) => {
	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<Card
					className={`grid grid-cols-4 gap-3 p-2.5 mb-1.5 hover:bg-gray-100 hover:shadow-lg transition ${selected ? "selected" : ""}`}
					onClick={onLeftClick}
				>
					<CardTitle className="flex items-center">
						{folder ? (
							<FolderIcon className={metadata.deleted_at ? "text-red-400" : undefined} />
						) : (
							<FileText className={metadata.deleted_at ? "text-red-400" : undefined} />
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
							<CardContent>{filesize(metadata.size)}</CardContent>
							<CardContent>{new Date(metadata.created_at).toLocaleString()}</CardContent>
						</>
					)}
				</Card>
			</ContextMenuTrigger>
			<ContextMenuContent>
				{/*TODO: add some <ContextMenuSeparator /> between the existing elements*/}

				{onDownload && (
					<ContextMenuItem className="flex space-x-4 cursor-pointer" onClick={onDownload}>
						<FileDown />
						<ContextMenuLabel>Download</ContextMenuLabel>
					</ContextMenuItem>
				)}

				{onRename && (
					<ContextMenuItem className="flex space-x-4 cursor-pointer" onClick={onRename}>
						<Edit />
						<ContextMenuLabel>Rename</ContextMenuLabel>
					</ContextMenuItem>
				)}

				{onMove && (
					<ContextMenuItem className="flex space-x-4 cursor-pointer" onClick={onMove}>
						<Move />
						<ContextMenuLabel>Move</ContextMenuLabel>
					</ContextMenuItem>
				)}

				{onDelete && (
					<ContextMenuItem className="flex space-x-4 cursor-pointer" onClick={onDelete}>
						<Trash />
						<ContextMenuLabel>Delete</ContextMenuLabel>
					</ContextMenuItem>
				)}

				{onRestore && (
					<ContextMenuItem className="flex space-x-4 cursor-pointer" onClick={onRestore}>
						<ArchiveRestore />
						<ContextMenuLabel>Restore</ContextMenuLabel>
					</ContextMenuItem>
				)}
			</ContextMenuContent>
		</ContextMenu>
	);
};

export default FileCard;
