import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { filesize } from "filesize";
import {
	ArchiveRestore,
	Copy,
	Download,
	Edit,
	Eye,
	FileText,
	FolderIcon,
	MoreHorizontal,
	Move,
	Share2,
	Trash,
} from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
	};

	const fileName = metadata.path.split("/").pop();

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
					className={`
                                                group transition-all duration-200 cursor-pointer border-b border-transparent
                                                ${clicked ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"}
                                                ${selected ? "bg-primary/10" : ""}
                                                ${isOver ? "bg-success/10 ring-2 ring-success/30 ring-inset" : ""}
                                        `}
				>
					<TableCell className="w-12 pl-4">
						<Checkbox
							disabled={!setSelected}
							checked={selected}
							onClick={(e) => {
								e.stopPropagation();
								if (setSelected) setSelected();
							}}
							className="transition-transform duration-200 hover:scale-110"
						/>
					</TableCell>

					<TableCell className="py-3">
						<div
							ref={!folder ? setDraggableRef : undefined}
							{...(folder ? {} : { ...attributes, ...listeners })}
							className="flex items-center gap-3"
						>
							<div
								className={`
                                                                flex items-center justify-center size-10 rounded-xl transition-all duration-200
                                                                ${
																																	folder
																																		? "bg-amber-100 text-amber-600 group-hover:bg-amber-200"
																																		: "bg-purple-50 text-purple-500 group-hover:bg-purple-100"
																																}
                                                                ${metadata.deleted_at ? "opacity-50" : ""}
                                                        `}
							>
								<FileIcon className="size-5" />
							</div>
							<div className="flex flex-col min-w-0">
								<span
									className={`font-medium text-sm truncate ${metadata.deleted_at ? "text-muted-foreground line-through" : ""}`}
								>
									{fileName}
								</span>
								{!folder && fileTypeInfo && (
									<span className="text-xs text-muted-foreground capitalize">{fileTypeInfo.category}</span>
								)}
							</div>
						</div>
					</TableCell>

					<TableCell className="text-muted-foreground text-sm">
						{folder ? <span className="text-xs bg-muted px-2 py-1 rounded-md">Folder</span> : filesize(metadata.size)}
					</TableCell>

					<TableCell className="text-muted-foreground text-sm">
						{new Date(metadata.created_at).toLocaleDateString(undefined, {
							year: "numeric",
							month: "short",
							day: "numeric",
						})}
					</TableCell>

					<TableCell className="pr-4">
						<div className="flex justify-end">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="size-8" onClick={(e) => e.stopPropagation()}>
										<MoreHorizontal className="size-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-48">
									{onPreview && fileTypeInfo?.canPreview && (
										<DropdownMenuItem onClick={onPreview}>
											<Eye className="size-4 mr-2" />
											Preview
										</DropdownMenuItem>
									)}
									{onDownload && (
										<DropdownMenuItem onClick={onDownload}>
											<Download className="size-4 mr-2" />
											Download
										</DropdownMenuItem>
									)}
									{(onPreview || onDownload) && (onShare || onRename || onMove) && <DropdownMenuSeparator />}
									{onShare && (
										<DropdownMenuItem onClick={onShare}>
											<Share2 className="size-4 mr-2" />
											Share
										</DropdownMenuItem>
									)}
									{onRename && (
										<DropdownMenuItem onClick={onRename}>
											<Edit className="size-4 mr-2" />
											Rename
										</DropdownMenuItem>
									)}
									{onMove && (
										<DropdownMenuItem onClick={onMove}>
											<Move className="size-4 mr-2" />
											Move to...
										</DropdownMenuItem>
									)}
									{onDuplicate && (
										<DropdownMenuItem onClick={onDuplicate}>
											<Copy className="size-4 mr-2" />
											Duplicate
										</DropdownMenuItem>
									)}
									{onCopy && (
										<DropdownMenuItem onClick={onCopy}>
											<Copy className="size-4 mr-2" />
											Copy
										</DropdownMenuItem>
									)}
									{(onDelete || onHardDelete || onRestore) && <DropdownMenuSeparator />}
									{onDelete && (
										<DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
											<Trash className="size-4 mr-2" />
											Move to Trash
										</DropdownMenuItem>
									)}
									{onHardDelete && (
										<DropdownMenuItem onClick={onHardDelete} className="text-destructive focus:text-destructive">
											<Trash className="size-4 mr-2" />
											Delete permanently
										</DropdownMenuItem>
									)}
									{onRestore && (
										<DropdownMenuItem onClick={onRestore} className="text-success focus:text-success">
											<ArchiveRestore className="size-4 mr-2" />
											Restore
										</DropdownMenuItem>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</TableCell>
				</TableRow>
			</ContextMenuTrigger>

			<ContextMenuContent className="w-56 rounded-xl shadow-soft-lg border-0 p-1.5">
				{onPreview && fileTypeInfo?.canPreview && (
					<ContextMenuItem onClick={onPreview} className="rounded-lg gap-3 py-2.5">
						<Eye className="size-4 text-muted-foreground" />
						<span>Preview</span>
					</ContextMenuItem>
				)}
				{onDownload && (
					<ContextMenuItem onClick={onDownload} className="rounded-lg gap-3 py-2.5">
						<Download className="size-4 text-muted-foreground" />
						<span>Download</span>
					</ContextMenuItem>
				)}
				{(onPreview || onDownload) && (onShare || onRename || onMove) && <ContextMenuSeparator className="my-1" />}
				{onShare && (
					<ContextMenuItem onClick={onShare} className="rounded-lg gap-3 py-2.5">
						<Share2 className="size-4 text-muted-foreground" />
						<span>Share</span>
					</ContextMenuItem>
				)}
				{onRename && (
					<ContextMenuItem onClick={onRename} className="rounded-lg gap-3 py-2.5">
						<Edit className="size-4 text-muted-foreground" />
						<span>Rename</span>
					</ContextMenuItem>
				)}
				{onMove && (
					<ContextMenuItem onClick={onMove} className="rounded-lg gap-3 py-2.5">
						<Move className="size-4 text-muted-foreground" />
						<span>Move to...</span>
					</ContextMenuItem>
				)}
				{onDuplicate && (
					<ContextMenuItem onClick={onDuplicate} className="rounded-lg gap-3 py-2.5">
						<Copy className="size-4 text-muted-foreground" />
						<span>Duplicate</span>
					</ContextMenuItem>
				)}
				{onCopy && (
					<ContextMenuItem onClick={onCopy} className="rounded-lg gap-3 py-2.5">
						<Copy className="size-4 text-muted-foreground" />
						<span>Copy</span>
					</ContextMenuItem>
				)}
				{(onDelete || onHardDelete || onRestore) && <ContextMenuSeparator className="my-1" />}
				{onDelete && (
					<ContextMenuItem
						onClick={onDelete}
						className="rounded-lg gap-3 py-2.5 text-destructive focus:text-destructive"
					>
						<Trash className="size-4" />
						<span>Move to Trash</span>
					</ContextMenuItem>
				)}
				{onHardDelete && (
					<ContextMenuItem
						onClick={onHardDelete}
						className="rounded-lg gap-3 py-2.5 text-destructive focus:text-destructive"
					>
						<Trash className="size-4" />
						<span>Delete permanently</span>
					</ContextMenuItem>
				)}
				{onRestore && (
					<ContextMenuItem onClick={onRestore} className="rounded-lg gap-3 py-2.5 text-success focus:text-success">
						<ArchiveRestore className="size-4" />
						<span>Restore</span>
					</ContextMenuItem>
				)}
			</ContextMenuContent>
		</ContextMenu>
	);
};

export default FileCard;
