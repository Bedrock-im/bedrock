import { filesize } from "filesize";
import { ArchiveRestore, Download, Edit, FileDown, FileText, FolderIcon, Move, Trash } from "lucide-react";
import React from "react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { DriveFile, DriveFolder } from "@/stores/drive";

export type FileCardProps = {
	isNew?: boolean;
	clicked?: boolean;
	selected?: boolean;
	setSelected?: () => void;
	onLeftClick?: () => void;
	onDoubleClick?: () => void;
	onDelete?: () => void;
	onRename?: () => void;
	onMove?: () => void;
	onDownload?: () => void;
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
	isNew,
	folder,
	clicked = false,
	selected = false,
	setSelected,
	onLeftClick,
	onDoubleClick,
	onDelete,
	onMove,
	onRename,
	onDownload,
	onRestore,
	metadata,
}: FileCardProps) => {
	if (isNew) {
		return (
			<TableRow
				onClick={(e) => {
					e.stopPropagation();
					if (onLeftClick) onLeftClick();
				}}
				onDoubleClick={onDoubleClick}
				className={clicked ? "bg-secondary/30 hover:bg-secondary/40" : ""}
			>
				<TableCell>
					<Checkbox
						disabled={!setSelected}
						checked={selected}
						onClick={(e) => {
							e.stopPropagation();
							if (setSelected) setSelected();
						}}
					/>
				</TableCell>
				<TableCell>
					<div className="flex items-center font-bold gap-2">
						{folder ? (
							<FolderIcon className={metadata.deleted_at ? "text-red-400" : undefined} />
						) : (
							<FileText className={metadata.deleted_at ? "text-red-400" : undefined} />
						)}
						{metadata.path.split("/").pop()}
					</div>
				</TableCell>
				<TableCell>{folder ? "" : filesize(metadata.size)}</TableCell>
				<TableCell>{new Date(metadata.created_at).toLocaleString()}</TableCell>
				<TableCell className="flex justify-end items-center gap-2 mt-1">
					{!folder && <Download size={16} />}
					<Trash size={16} />
				</TableCell>
			</TableRow>
		);
	}

	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<Card
					className={`grid grid-cols-4 gap-3 p-2.5 mb-1.5 hover:bg-gray-100 hover:shadow-lg transition ${selected ? "selected" : ""}`}
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
