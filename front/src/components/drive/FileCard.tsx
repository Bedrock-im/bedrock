import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { filesize } from "filesize";
import { Download, Edit, Share2, FileText, FolderIcon, Move, Trash, ArchiveRestore, Copy, Eye } from "lucide-react";
import React from "react";

import ActionIcon from "@/components/drive/ActionIcon";
import { Checkbox } from "@/components/ui/checkbox";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { DriveFile, DriveFolder } from "@/stores/drive";
import { getFileTypeInfo } from "@/utils/file-types";

export type FileCardProps = {
	clicked?: boolean;
	selected?: boolean;
	setSelected?: () => void;
	onLeftClick?: () => void;
	onDelete?: () => void;
	onShare?: () => void;
	onDoubleClick?: () => void;
	onDownload?: () => void;
	onRename?: () => void;
	onMove?: () => void;
	onHardDelete?: () => void;
	onRestore?: () => void;
	onDuplicate?: (() => Promise<void>) | undefined;
	onCopy?: () => void;
	onPreview?: () => void;
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
	onShare,
	onDownload,
	onRename,
	onMove,
	onRestore,
	onHardDelete,
	onDuplicate,
	onCopy,
	onPreview,
}: FileCardProps) => {
	const fileTypeInfo = folder ? null : getFileTypeInfo(metadata.path);
	const FileIcon = folder ? FolderIcon : fileTypeInfo?.icon || FileText;
	const {
		attributes,
		listeners,
		setNodeRef: setDraggableRef,
		transform,
	} = useDraggable({
		id: metadata.path,
		disabled: folder,
	});

	const { setNodeRef: setDroppableRef, isOver } = useDroppable({
		id: metadata.path,
		disabled: !folder,
	});

	const style = {
		transform: CSS.Translate.toString(transform) || undefined,
		backgroundColor: folder && isOver ? "rgba(0, 128, 0, 0.08)" : undefined,
		transition: "background-color 0.2s ease",
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<TableRow
					ref={folder ? setDroppableRef : undefined}
					style={style}
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
						<div
							ref={!folder ? setDraggableRef : undefined}
							{...(folder ? {} : { ...attributes, ...listeners })}
							className="flex items-center font-bold gap-2"
						>
							<FileIcon className={metadata.deleted_at ? "text-red-400" : undefined} />
							{metadata.path.split("/").pop()}
						</div>
					</TableCell>

					<TableCell>{folder ? "" : filesize(metadata.size)}</TableCell>
					<TableCell>{new Date(metadata.created_at).toLocaleString()}</TableCell>

					<TableCell className="flex justify-end items-center gap-2 mt-1">
						{onPreview && fileTypeInfo?.canPreview && (
							<ActionIcon Icon={Eye} onClick={onPreview} tooltip="Preview" />
						)}
						{onDownload && <ActionIcon Icon={Download} onClick={onDownload} tooltip="Download" />}
						{onShare && <ActionIcon Icon={Share2} onClick={onShare} tooltip="Share" />}
						{onRename && <ActionIcon Icon={Edit} onClick={onRename} tooltip="Rename" />}
						{onMove && <ActionIcon Icon={Move} onClick={onMove} tooltip="Move" />}
						{onDelete && <ActionIcon Icon={Trash} onClick={onDelete} tooltip="Delete" />}
						{onHardDelete && <ActionIcon Icon={Trash} onClick={onHardDelete} tooltip="Definitive delete" />}
						{onRestore && <ActionIcon Icon={ArchiveRestore} onClick={onRestore} tooltip="Restore" />}
						{onCopy && <ActionIcon Icon={Copy} onClick={onCopy} tooltip={"copy"} />}
					</TableCell>
				</TableRow>
			</ContextMenuTrigger>

			<ContextMenuContent>
				{onPreview && fileTypeInfo?.canPreview && (
					<ContextMenuItem onClick={onPreview}>
						<Eye className="mr-2 h-4 w-4" />
						Preview
					</ContextMenuItem>
				)}
				{onDownload && (
					<ContextMenuItem onClick={onDownload}>
						<Download className="mr-2 h-4 w-4" />
						Download
					</ContextMenuItem>
				)}
				{onShare && (
					<ContextMenuItem onClick={onShare}>
						<Share2 className="mr-2 h-4 w-4" />
						Share
					</ContextMenuItem>
				)}
				{onRename && (
					<ContextMenuItem onClick={onRename}>
						<Edit className="mr-2 h-4 w-4" />
						Rename
					</ContextMenuItem>
				)}
				{onMove && (
					<ContextMenuItem onClick={onMove}>
						<Move className="mr-2 h-4 w-4" />
						Move
					</ContextMenuItem>
				)}
				{onDelete && (
					<ContextMenuItem onClick={onDelete}>
						<Trash className="mr-2 h-4 w-4" />
						Delete
					</ContextMenuItem>
				)}
				{onHardDelete && (
					<ContextMenuItem onClick={onHardDelete}>
						<Trash className="mr-2 h-4 w-4" />
						Definitive delete
					</ContextMenuItem>
				)}
				{onRestore && (
					<ContextMenuItem onClick={onRestore}>
						<ArchiveRestore className="mr-2 h-4 w-4" />
						Restore
					</ContextMenuItem>
				)}
				{onDuplicate && (
					<ContextMenuItem onClick={onDuplicate}>
						<ArchiveRestore className="mr-2 h-4 w-4" />
						duplicate
					</ContextMenuItem>
				)}
				{onCopy && (
					<ContextMenuItem onClick={onCopy}>
						<ArchiveRestore className="mr-2 h-4 w-4" />
						copy
					</ContextMenuItem>
				)}
			</ContextMenuContent>
		</ContextMenu>
	);
};

export default FileCard;
