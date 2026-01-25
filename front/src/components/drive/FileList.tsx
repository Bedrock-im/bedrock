"use client";

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Contact, FileFullInfo } from "bedrock-ts-sdk";
import { Ban, ClipboardPaste, Download, FolderIcon, Move, Share2, Trash } from "lucide-react";
import { useQueryState } from "nuqs";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import CurrentPath from "@/components/drive/CurrentPath";
import FileCard from "@/components/drive/FileCard";
import FilePreviewDialog from "@/components/drive/FilePreviewDialog";
import SortOption from "@/components/drive/SortOption";
import { FileMoveModal } from "@/components/FileMoveModal";
import { FileRenameModal } from "@/components/FileRenameModal";
import { FileShareModal } from "@/components/FileShareModal";
import { FolderCreateModal } from "@/components/FolderCreateModal";
import { PublicFileLinkModal } from "@/components/PublicFileLinkModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useBedrockFileUploadDropzone from "@/hooks/use-bedrock-file-upload-dropzone";
import { useAccountStore } from "@/stores/account";
import { DriveFile, DriveFolder, useDriveStore } from "@/stores/drive";
import { notNullGuard } from "@/utils/types";

import UploadButton from "./UploadButton";

type SortColumn = "path" | "size" | "created_at";
type SortOrder = "asc" | "desc";

type FileListProps = {
	files?: DriveFile[];
	folders?: DriveFolder[];
	actions?: (
		| "upload"
		| "rename"
		| "download"
		| "delete"
		| "share"
		| "move"
		| "restore"
		| "hardDelete"
		| "duplicate"
		| "copy"
		| "bulk"
	)[];
	defaultCwd?: string;
	defaultSearchQuery?: string;
	onSelectedItemPathsChange?: (selectedItemPaths: Set<string>) => void;
	selectedPaths?: string[];
	trash?: boolean;
	knowledgeBase?: boolean;
	emptyMessage: string;
};

const FileList: React.FC<FileListProps> = ({
	files: propFiles,
	folders: propFolders,
	actions = [],
	defaultCwd = "/",
	defaultSearchQuery = "",
	onSelectedItemPathsChange,
	selectedPaths = [],
	trash = false,
	knowledgeBase = false,
	emptyMessage,
}) => {
	const username = useAccountStore((state) => state.username);

	const [searchQuery, setSearchQuery] = useQueryState("search", { defaultValue: defaultSearchQuery });
	const [currentWorkingDirectory, setCurrentWorkingDirectory] = useQueryState("cwd", {
		defaultValue: defaultCwd,
		history: "push",
	});
	const [fileToMove, setFileToMove] = useState<{ path: string; folder: boolean } | null>(null);
	const [fileToRename, setFileToRename] = useState<FileFullInfo | null>(null);
	const [fileToShare, setFileToShare] = useState<FileFullInfo | null>(null);
	const [fileToPreview, setFileToPreview] = useState<DriveFile | null>(null);
	const [isCreatingFolder, setIsCreatingFolder] = useState(false);
	const [sortColumn, setSortColumn] = useQueryState("sort", { defaultValue: "path" as SortColumn });
	const [sortOrder, setSortOrder] = useQueryState("order", { defaultValue: "asc" as SortOrder });
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(selectedPaths));
	const [copiedFilePath, setcopiedFilePath] = useState<string | null>(null);
	const [clickedItem, setClickedItem] = useState<string>();
	const [sharedHash, setSharedHash] = useState<string | null>(null);
	const {
		setFiles,
		setFolders,
		softDeleteFile,
		hardDeleteFile,
		addFolder,
		softDeleteFolder,
		hardDeleteFolder,
		moveFile,
		moveFolder,
		restoreFile,
		files,
		folders,
		setSharedFiles,
		setContacts,
		contacts,
	} = useDriveStore();
	const { bedrockClient } = useAccountStore();
	const { getInputProps } = useBedrockFileUploadDropzone({});

	const cwdRegex = `^${currentWorkingDirectory.replace("/", "\\/")}[^\\/]+$`;
	const isSearchItem = (query: string, path: string, name: string) => {
		const lowerCaseQuery = query.toLowerCase();

		if (lowerCaseQuery.includes("/")) return path.toLowerCase().includes(lowerCaseQuery);
		else return name.toLowerCase().includes(lowerCaseQuery);
	};

	const currentPathFiles = (propFiles ?? files).filter(
		(file) =>
			(searchQuery ? isSearchItem(searchQuery, file.path, file.name) : file.path.match(cwdRegex)) &&
			(trash ? file.deleted_at !== null : file.deleted_at === null),
	);

	const currentPathFolders = (propFolders ?? folders).filter(
		(folder) =>
			folder.path !== currentWorkingDirectory && // Don't show the current directory
			(searchQuery
				? isSearchItem(searchQuery, folder.path, folder.path.split("/").pop() ?? "")
				: folder.path.match(cwdRegex)) &&
			(trash ? folder.deleted_at !== null : folder.deleted_at === null),
	);

	useEffect(() => {
		if (!bedrockClient) return;

		(async () => {
			try {
				const fileEntries = await bedrockClient.files.fetchFileEntries();
				const fullFiles = await bedrockClient.files.fetchFilesMetaFromEntries(fileEntries);
				const contacts = await bedrockClient.contacts.listContacts();
				const sharedFilesByContacts = await Promise.all(
					contacts.map(async (c) => {
						try {
							return await bedrockClient.contacts.fetchFilesSharedByContact(c.public_key);
						} catch (_) {
							return null;
						}
					}),
				);
				const sharedFiles = sharedFilesByContacts.filter(notNullGuard).flat();

				const folderPaths = new Set<string>();
				const trashFolderPaths = new Set<string>();

				fullFiles
					.filter(({ deleted_at }) => deleted_at === null)
					.forEach((file) => {
						const pathParts = file.path.split("/").filter(Boolean);
						if (pathParts.length > 1) {
							pathParts.pop();
							let currentPath = "";
							pathParts.forEach((part) => {
								currentPath += `/${part}`;
								folderPaths.add(currentPath);
							});
						}
					});

				fullFiles
					.filter(({ deleted_at }) => deleted_at !== null)
					.forEach((file) => {
						const pathParts = file.path.split("/").filter(Boolean);
						if (pathParts.length > 1) {
							pathParts.pop();
							let currentPath = "";
							pathParts.forEach((part) => {
								currentPath += `/${part}`;
								trashFolderPaths.add(currentPath);
							});
						}
					});

				setFiles(fullFiles);
				setFolders([
					...Array.from(folderPaths)
						.filter((path) => path !== "/")
						.map((path) => ({
							path,
							created_at: new Date().toISOString(),
							deleted_at: null,
							shared_with: [],
							shared_keys: {},
						})),
					...Array.from(trashFolderPaths)
						.filter((path) => path !== "/")
						.map((path) => ({
							path,
							created_at: new Date().toISOString(),
							deleted_at: new Date().toISOString(),
							shared_with: [],
							shared_keys: {},
						})),
				]);
				setSharedFiles(sharedFiles);
				setContacts(contacts);
			} catch (error) {
				console.error("Failed to fetch files:", error);
			}
		})();
	}, [bedrockClient, setFolders, setFiles, setSharedFiles, setContacts]);

	const { sortedFiles, sortedFolders } = useMemo(
		() => ({
			sortedFiles: currentPathFiles.sort((a, b) => {
				if (sortColumn === "size") {
					return (a.size - b.size) * (sortOrder === "asc" ? 1 : -1);
				} else if (sortColumn === "created_at") {
					return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * (sortOrder === "asc" ? 1 : -1);
				}
				return a.path.localeCompare(b.path) * (sortOrder === "asc" ? 1 : -1);
			}),
			sortedFolders: currentPathFolders.sort((a, b) => {
				if (sortColumn === "created_at") {
					return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * (sortOrder === "asc" ? 1 : -1);
				}
				return a.path.localeCompare(b.path) * (sortOrder === "asc" ? 1 : -1);
			}),
		}),
		[currentPathFiles, currentPathFolders, sortColumn, sortOrder],
	);

	const handleChangeDirectory = (newPath: string) => {
		if (!knowledgeBase) {
			const newSelectedItems = new Set<string>();
			setSelectedItems(newSelectedItems);
			onSelectedItemPathsChange?.(newSelectedItems);
		}
		setCurrentWorkingDirectory(newPath);
	};

	const handleDownloadFile = async (file: DriveFile) => {
		if (!bedrockClient) return;

		try {
			const arrayBuffer = await bedrockClient.files.downloadFile(file);
			const blob = new Blob([arrayBuffer as BlobPart], { type: "application/octet-stream" });
			const url = URL.createObjectURL(blob);

			const link = document.createElement("a");
			link.href = url;
			link.download = file.path.split("/").pop() || "downloaded-file";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			toast.error("Failed to download file:" + error?.toString());
		}
	};

	const handleCreateFolder = (folderName: string) => {
		const newFolderPath = `${currentWorkingDirectory}${folderName}`;

		// TODO: this check should be moved to the drive or bedrock service to check against all files, not just those passed to this component
		// if (folders.some((folder) => folder.path === newFolderPath)) {
		//      toast.error("This folder already exists!");
		//      return;
		// }

		const newFolder: DriveFolder = {
			path: newFolderPath,
			created_at: new Date().toISOString(),
			deleted_at: null,
			shared_with: [],
			shared_keys: {},
		};

		addFolder(newFolder);
		setIsCreatingFolder(false);
		toast.success(`The folder "${folderName}" has been created.`);
	};

	const handleRename = (path: string, folder: boolean, newName: string) => {
		const newPath = `${path.split("/").slice(0, -1).join("/")}/${newName}`;

		if (!folder) {
			moveFile(path, newPath);
			bedrockClient?.files.moveFiles([{ oldPath: path, newPath: newPath }]);
		} else {
			const filesToMove = moveFolder(path, newPath);
			const paths = filesToMove.map(([oldFile, newFile]) => ({ oldPath: oldFile.path, newPath: newFile.path }));

			bedrockClient?.files.moveFiles(paths);
		}
		setFileToRename(null);
		toast.success(`The ${folder ? "folder" : "file"} has been renamed.`);
	};

	const handleDuplicate = async (path: string, folder: boolean) => {
		if (folder) {
			alert("Folder duplication is not supported yet.");
			return;
		}

		const originalFile = files.find((f) => f.path === path);
		if (!originalFile || !bedrockClient) return;

		const nameParts = path.split("/");
		const filename = nameParts.pop()!;
		const dir = nameParts.join("/");

		const hasExtension = filename.includes(".");
		const ext = hasExtension ? "." + filename.split(".").pop()! : "";
		const baseName = hasExtension ? filename.slice(0, -ext.length) : filename;

		let copyName = `${baseName}_copy${ext}`;
		let counter = 2;
		while (files.some((f) => f.path === `${dir}/${copyName}`)) {
			copyName = `${baseName}_copy_${(counter += 1)}${ext}`;
		}

		const newPath = `${dir}/${copyName}`;

		const newFile = await bedrockClient.files.duplicateFile(path, newPath);
		if (!newFile) {
			console.error("File duplication failed");
			return;
		}

		setFiles([...files, newFile]);
	};

	const handleSoftDelete = (path: string, folder: boolean) => {
		const deletionDatetime = new Date();
		if (folder) {
			const filesToDelete = softDeleteFolder(
				path,
				deletionDatetime,
				currentWorkingDirectory + path.slice(0, path.length).split("/").pop()!,
			);
			bedrockClient?.files.softDeleteFiles(
				filesToDelete.map((f) => f.path),
				deletionDatetime,
			);
		} else {
			const file = softDeleteFile(path, deletionDatetime, `/${path.split("/").pop()!}`);
			if (file) bedrockClient?.files.softDeleteFiles([file.path], deletionDatetime);
		}
	};

	const handleHardDelete = (path: string, folder: boolean) => {
		if (folder) {
			const filesToDelete = hardDeleteFolder(path);
			bedrockClient?.files.hardDeleteFiles(filesToDelete.map((f) => f.path));
		} else {
			const fileToDelete = files.find((file) => file.path === path);
			if (!fileToDelete) {
				console.error("File not found:", path);
				return;
			}
			hardDeleteFile(fileToDelete.path);
			bedrockClient?.files.hardDeleteFiles([fileToDelete.path]);
		}
		toast.success(`The ${folder ? "folder" : "file"} has been permanently deleted.`);
	};

	const handleMove = (path: string, newPath: string, folder: boolean) => {
		newPath = newPath.startsWith("/") ? newPath : `/${newPath}`;

		if (!folder) {
			moveFile(path, newPath);
			bedrockClient?.files.moveFiles([{ oldPath: path, newPath }]);
		} else {
			const filesToMove = moveFolder(path, newPath);
			const paths = filesToMove.map(([oldFile, newFile]) => ({ oldPath: oldFile.path, newPath: newFile.path }));

			bedrockClient?.files.moveFiles(paths);
		}
		setFileToMove(null);
		toast.success(`The ${folder ? "folder" : "file"} has been moved.`);
	};

	const handleShare = (file: FileFullInfo, contact?: Contact) => {
		toast.loading(`Sharing file...`);
		if (contact) {
			bedrockClient?.files.shareFile(file.path, contact.public_key);
			toast.success(`The file has been shared with contact ${contact.name}.`);
		} else {
			bedrockClient?.files
				.shareFilePublicly(file, username ?? "Unknown")
				.then((hash) => {
					toast.success(`The file has been shared publicly.`);
					setSharedHash(hash);
				})
				.catch((_) => {
					toast.error("Unable to share the file publicly");
				});
		}
		setFileToShare(null);
	};

	const handleRestoreFile = (path: string) => {
		const hash = restoreFile(path);
		if (hash) {
			const fileToRestore = files.find((f) => f.post_hash === hash);
			if (fileToRestore) bedrockClient?.files.restoreFiles([fileToRestore.path]);
		}
	};

	const selectItem = (path: string) => {
		setSelectedItems((prev) => {
			const updated = new Set(prev);
			if (updated.has(path)) {
				updated.delete(path);
			} else {
				updated.add(path);
			}
			onSelectedItemPathsChange?.(updated);
			return updated;
		});
	};

	const handleCopy = (path: string) => {
		setcopiedFilePath(path);
		toast.success(`file copied`);
	};

	const handlePaste = async () => {
		if (!copiedFilePath || !bedrockClient) return;

		const originalFile = files.find((f) => f.path === copiedFilePath);
		if (!originalFile) {
			console.error("File not found");
			return;
		}

		const filename = originalFile.path.split("/").pop()!;
		const hasExtension = filename.includes(".");
		const ext = hasExtension ? "." + filename.split(".").pop()! : "";
		const baseName = hasExtension ? filename.slice(0, -ext.length) : filename;

		let copyName = `${baseName}_copy${ext}`;
		let counter = 2;
		while (files.some((f) => f.path === `${currentWorkingDirectory}${copyName}`)) {
			copyName = `${baseName}_copy_${(counter += 1)}${ext}`;
		}

		const newPath = `${currentWorkingDirectory}${copyName}`;
		const newFile = await bedrockClient.files.duplicateFile(copiedFilePath, newPath);

		setFiles([...files, newFile]);
		setcopiedFilePath(null);
	};

	const selectAll = () => {
		setSelectedItems((prev) => {
			if (prev.size === currentPathFiles.length + currentPathFolders.length) {
				return new Set();
			}

			const updated = new Set<string>(prev);
			currentPathFiles.forEach((file) => updated.add(file.path));
			currentPathFolders.forEach((folder) => updated.add(folder.path + "/"));
			onSelectedItemPathsChange?.(updated);
			return updated;
		});
	};

	if (!bedrockClient) {
		return (
			<div className="flex flex-col items-center justify-center h-full gap-4">
				<div className="relative">
					<div className="size-12 rounded-full border-4 border-muted border-t-primary animate-spin" />
				</div>
				<p className="text-sm text-muted-foreground">Loading your files...</p>
			</div>
		);
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!active || !over) return;

		const draggedPath = active.id.toString();
		const targetFolderPath = over.id.toString();

		if (draggedPath !== targetFolderPath) {
			const newPath = `${targetFolderPath}/${draggedPath.split("/").pop()}`;
			moveFile(draggedPath, newPath);
			bedrockClient?.files.moveFiles([{ oldPath: draggedPath, newPath }]);
		}
	};

	return (
		<div className="flex flex-col h-full" onClick={() => setClickedItem(undefined)}>
			<PublicFileLinkModal hash={sharedHash ?? ""} isOpen={!!sharedHash} onClose={() => setSharedHash(null)} />
			{fileToMove && (
				<FileMoveModal
					isOpen={true}
					onClose={() => setFileToMove(null)}
					onComplete={(newPath) => handleMove(fileToMove.path, newPath, fileToMove.folder)}
				/>
			)}
			{fileToRename && (
				<FileRenameModal
					isOpen={true}
					onClose={() => setFileToRename(null)}
					onComplete={(newName) => handleRename(fileToRename.path, false, newName)}
				/>
			)}
			{fileToShare && (
				<FileShareModal
					isOpen={true}
					onClose={() => setFileToShare(null)}
					onComplete={(contact) => handleShare(fileToShare, contact)}
					contacts={contacts}
				/>
			)}
			{fileToPreview && (
				<FilePreviewDialog
					file={fileToPreview}
					isOpen={true}
					onClose={() => setFileToPreview(null)}
					onDownload={() => handleDownloadFile(fileToPreview)}
				/>
			)}
			<FolderCreateModal
				isOpen={isCreatingFolder}
				onClose={() => setIsCreatingFolder(false)}
				onComplete={handleCreateFolder}
			/>
			<div className="flex justify-between items-center m-2 gap-4">
				{actions.includes("upload") && (
					<UploadButton onCreateFolder={() => setIsCreatingFolder(true)} getInputProps={getInputProps} />
				)}
				<input type="file" id="fileInput" className="hidden" onChange={() => {}} />
				<input
					type="text"
					placeholder="Search files and folders..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value || null)}
					className="px-4 py-2.5 bg-background border border-border rounded-xl w-full text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
				/>
			</div>

			<DndContext onDragEnd={handleDragEnd}>
				<Card className="m-2 mb-20 shadow-soft rounded-xl border-0 bg-card overflow-hidden">
					<div className="m-4 mt-2">
						<CurrentPath path={currentWorkingDirectory} setPath={handleChangeDirectory} />
						<Separator orientation="horizontal" />
					</div>
					{sortedFiles.length === 0 && sortedFolders.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<div className="size-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
								<FolderIcon className="size-8 text-muted-foreground/50" />
							</div>
							{searchQuery ? (
								<p className="text-muted-foreground">No files or folders match your search.</p>
							) : (
								<>
									<p className="text-muted-foreground font-medium">
										{currentWorkingDirectory === "/" ? emptyMessage : "This folder is empty"}
									</p>
									<p className="text-sm text-muted-foreground/70 mt-1">Upload files or create folders to get started</p>
								</>
							)}
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12 pl-4">
										<Checkbox
											checked={selectedItems.size === files.length + folders.length}
											onClick={(e) => {
												e.stopPropagation();
												selectAll();
											}}
										/>
									</TableHead>
									<TableHead>
										<SortOption
											option="path"
											name="Name"
											sortColumn={sortColumn}
											sortOrder={sortOrder}
											setSortColumn={setSortColumn}
											setSortOrder={setSortOrder}
										/>
									</TableHead>
									<TableHead>
										<SortOption
											option="size"
											name="Size"
											sortColumn={sortColumn}
											sortOrder={sortOrder}
											setSortColumn={setSortColumn}
											setSortOrder={setSortOrder}
										/>
									</TableHead>
									<TableHead>
										<SortOption
											option="created_at"
											name="Created At"
											sortColumn={sortColumn}
											sortOrder={sortOrder}
											setSortColumn={setSortColumn}
											setSortOrder={setSortOrder}
										/>
									</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{/* TODO: concat both lists and show them together, so it can be sorted by name */}
								{sortedFolders.map((folder) => (
									<FileCard
										key={folder.path}
										folder
										metadata={folder}
										clicked={clickedItem === folder.path}
										selected={selectedItems.has(folder.path + "/")}
										setSelected={() => selectItem(folder.path + "/")}
										onLeftClick={() => setClickedItem(folder.path)}
										onDoubleClick={() => handleChangeDirectory(folder.path + "/")}
										onDelete={actions.includes("delete") ? () => handleSoftDelete(folder.path, true) : undefined}
										onHardDelete={
											actions.includes("hardDelete") ? () => handleHardDelete(folder.path, true) : undefined
										}
										onMove={
											actions.includes("move") ? () => setFileToMove({ path: folder.path, folder: true }) : undefined
										}
										onRestore={actions.includes("restore") ? () => handleRestoreFile(folder.path) : undefined}
									/>
								))}
								{sortedFiles.map((file) => (
									<FileCard
										key={file.path}
										metadata={file}
										clicked={clickedItem === file.path}
										selected={selectedItems.has(file.path)}
										setSelected={() => selectItem(file.path)}
										onLeftClick={() => setClickedItem(file.path)}
										onDoubleClick={() => setFileToPreview(file)}
										onPreview={() => setFileToPreview(file)}
										onDownload={actions.includes("download") ? () => handleDownloadFile(file) : undefined}
										onShare={actions.includes("share") ? () => setFileToShare(file) : undefined}
										onRename={actions.includes("rename") ? () => setFileToRename(file) : undefined}
										onMove={
											actions.includes("move") ? () => setFileToMove({ path: file.path, folder: false }) : undefined
										}
										onDelete={actions.includes("delete") ? () => handleSoftDelete(file.path, false) : undefined}
										onHardDelete={actions.includes("hardDelete") ? () => handleHardDelete(file.path, false) : undefined}
										onRestore={actions.includes("restore") ? () => handleRestoreFile(file.path) : undefined}
										onDuplicate={actions.includes("duplicate") ? () => handleDuplicate(file.path, false) : undefined}
										onCopy={actions.includes("copy") ? () => handleCopy(file.path) : undefined}
									/>
								))}
							</TableBody>
						</Table>
					)}
					{copiedFilePath != null && (
						<div className="fixed bottom-24 left-1/5 -translate-x-1/5 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-2xl shadow-glow flex items-center gap-4 animate-slide-up">
							<p className="text-sm font-medium">1 item copied to clipboard</p>
							<Button variant="secondary" size="sm" className="rounded-xl gap-2" onClick={() => handlePaste()}>
								<ClipboardPaste size={14} />
								Paste
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="text-primary-foreground/80 hover:text-primary-foreground rounded-lg"
								onClick={() => setcopiedFilePath(null)}
							>
								<Ban size={14} />
							</Button>
						</div>
					)}
					{actions.includes("bulk") && selectedItems.size > 0 && (
						<div className="fixed bottom-6 left-3/5 -translate-x-3/5 z-50 bg-foreground text-background px-4 md:px-6 py-3 rounded-2xl shadow-soft-lg animate-slide-up max-w-[90vw] md:max-w-fit">
							<div className="flex flex-wrap gap-3 md:gap-6 items-center justify-center">
								<span className="text-sm font-medium whitespace-nowrap">
									{selectedItems.size} item{selectedItems.size > 1 ? "s" : ""} selected
								</span>
								<div className="flex items-center gap-1 flex-wrap justify-center">
									<Button
										variant="ghost"
										className="text-white text-sm gap-2"
										onClick={() => {
											selectedItems.forEach((pathFile) => {
												const file = files.find((f) => f.path === pathFile);
												if (file) {
													handleDownloadFile(file);
												}
											});
										}}
									>
										<Download size={16} />
										Download
									</Button>
									<Button variant="ghost" className="text-white text-sm gap-2" disabled>
										<Share2 size={16} />
										Share
									</Button>
									<Button
										variant="ghost"
										className="text-white text-sm gap-2"
										disabled
										onClick={() => {
											selectedItems.forEach((file) => {
												setFileToMove({ path: file, folder: false });
											});
										}}
									>
										<Move size={16} />
										Move
									</Button>
									<Button
										variant="ghost"
										className="text-white text-sm gap-2"
										onClick={() => {
											selectedItems.forEach((file) => {
												handleSoftDelete(file, false);
											});
											setSelectedItems(new Set());
										}}
									>
										<Trash size={16} />
										Delete
									</Button>
								</div>
							</div>
						</div>
					)}
				</Card>
			</DndContext>
		</div>
	);
};

export default FileList;
