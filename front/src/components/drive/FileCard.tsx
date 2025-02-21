import { filesize } from "filesize";
import { Download, Edit, FileText, FolderIcon, Move, Trash, ArchiveRestore } from "lucide-react";
import React from "react";

import ActionIcon from "@/components/drive/ActionIcon";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { DriveFile, DriveFolder } from "@/stores/drive";

export type FileCardProps = {
	clicked?: boolean;
	selected?: boolean;
	setSelected?: () => void;
	onLeftClick?: () => void;
	onDelete?: () => void;
	onDoubleClick?: () => void;
	onDownload?: () => void;
	onRename?: () => void;
	onMove?: () => void;
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
	metadata,
	folder,
	clicked = false,
	selected = false,
	setSelected,
	onLeftClick,
	onDoubleClick,
	onDelete,
	onDownload,
	onRename,
	onMove,
	onRestore,
	onHardDelete,
}: FileCardProps) => {
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
				{onDownload && <ActionIcon Icon={Download} onClick={onDownload} tooltip="Download" />}
				{onRename && <ActionIcon Icon={Edit} onClick={onRename} tooltip="Rename" />}
				{onMove && <ActionIcon Icon={Move} onClick={onMove} tooltip="Move" />}
				{onDelete && <ActionIcon Icon={Trash} onClick={onDelete} tooltip="Delete" />}
				{onHardDelete && <ActionIcon Icon={Trash} onClick={onHardDelete} tooltip="Definitive delete" />}
				{onRestore && <ActionIcon Icon={ArchiveRestore} onClick={onRestore} tooltip="Restore" />}
			</TableCell>
		</TableRow>
	);

	/*
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

				{onSoftDelete && (
					<ContextMenuItem className="flex space-x-4 cursor-pointer" onClick={onSoftDelete}>
						<Trash />
						<ContextMenuLabel>Delete</ContextMenuLabel>
					</ContextMenuItem>
				)}

				{onHardDelete && (
					<ContextMenuItem className="flex space-x-4 cursor-pointer" onClick={onHardDelete}>
						<Trash />
						<ContextMenuLabel>Definitive delete</ContextMenuLabel>
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
	*/
};

export default FileCard;
