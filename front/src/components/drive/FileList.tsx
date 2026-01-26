"use client";

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Contact, FileFullInfo } from "bedrock-ts-sdk";
import { Copy, Download, FolderIcon, FolderPlus, Loader2, Move, Trash, Upload } from "lucide-react";
import { useQueryState } from "nuqs";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import CurrentPath from "@/components/drive/CurrentPath";
import FileCard from "@/components/drive/FileCard";
import FilePreviewDialog from "@/components/drive/FilePreviewDialog";
import SortOption from "@/components/drive/SortOption";
import { TableSkeleton } from "@/components/drive/TableSkeleton";
import { FileRenameModal } from "@/components/FileRenameModal";
import { FileShareModal } from "@/components/FileShareModal";
import { FolderBrowserModal } from "@/components/FolderBrowserModal";
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
import { getDestinationParent, getParentPath, joinPath, normalizePath } from "@/utils/path";
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
	const [fileToMove, setFileToMove] = useState<{ path: string; folder: boolean; name: string } | null>(null);
	const [fileToRename, setFileToRename] = useState<FileFullInfo | null>(null);
	const [fileToShare, setFileToShare] = useState<FileFullInfo | null>(null);
	const [fileToPreview, setFileToPreview] = useState<DriveFile | null>(null);
	const [isCreatingFolder, setIsCreatingFolder] = useState(false);
	const [sortColumn, setSortColumn] = useQueryState("sort", { defaultValue: "path" as SortColumn });
	const [sortOrder, setSortOrder] = useQueryState("order", { defaultValue: "asc" as SortOrder });
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(selectedPaths));
	const [fileToCopy, setFileToCopy] = useState<{ path: string; name: string } | null>(null);
	const [bulkMoveMode, setBulkMoveMode] = useState(false);
	const [bulkCopyMode, setBulkCopyMode] = useState(false);
	const [clickedItem, setClickedItem] = useState<string>();
	const [sharedHash, setSharedHash] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
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

		setIsLoading(true);
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
			} finally {
				setIsLoading(false);
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
		setSearchQuery(null);
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

	const handleRename = async (path: string, folder: boolean, newName: string) => {
		if (!bedrockClient) return;
		setActionLoading("rename");

		const newPath = `${path.split("/").slice(0, -1).join("/")}/${newName}`;
		const toastId = toast.loading(`Renaming ${folder ? "folder" : "file"}...`);

		try {
			if (!folder) {
				await bedrockClient.files.moveFiles([
					{
						oldPath: path,
						newPath: newPath,
					},
				]);
				moveFile(path, newPath);
			} else {
				const filesToMove = files.filter((f) => f.path.startsWith(path));
				const paths = filesToMove.map((f) => ({
					oldPath: f.path,
					newPath: newPath + f.path.slice(path.length),
				}));
				await bedrockClient.files.moveFiles(paths);
				moveFolder(path, newPath);
			}
			setFileToRename(null);
			toast.success(`The ${folder ? "folder" : "file"} has been renamed.`, { id: toastId });
		} catch {
			toast.error(`Failed to rename the ${folder ? "folder" : "file"}`, { id: toastId });
		} finally {
			setFileToRename(null);
			setActionLoading(null);
		}
	};

	const handleDuplicate = async (path: string, folder: boolean) => {
		if (!bedrockClient) return;
		setActionLoading("duplicate");

		if (folder) {
			toast.error("Folder duplication is not supported yet.");
			return;
		}

		const originalFile = files.find((f) => f.path === path);
		if (!originalFile) {
			toast.error("File not found");
			return;
		}

		const toastId = toast.loading("Duplicating file...");

		try {
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
				throw new Error("File duplication failed");
			}
			setFiles([...files, newFile]);
			toast.success("File has been duplicated.", { id: toastId });
		} catch {
			toast.error("Failed to duplicate file", { id: toastId });
		} finally {
			setActionLoading(null);
		}
	};

	const handleSoftDelete = async (path: string, folder: boolean) => {
		if (!bedrockClient) return;

		setActionLoading("delete");
		const deletionDatetime = new Date();
		const toastId = toast.loading(`Deleting ${folder ? "folder" : "file"}...`);

		try {
			if (folder) {
				const folderPrefix = path.endsWith("/") ? path : path + "/";
				const filePathsToDelete = files
					.filter((f) => f.path === path || f.path.startsWith(folderPrefix))
					.map((f) => f.path);
				await bedrockClient.files.softDeleteFiles(filePathsToDelete, deletionDatetime);
				softDeleteFolder(
					path,
					deletionDatetime,
					currentWorkingDirectory + path.slice(0, path.length).split("/").pop()!,
				);
			} else {
				await bedrockClient.files.softDeleteFiles([path], deletionDatetime);
				softDeleteFile(path, deletionDatetime, `/${path.split("/").pop()!}`);
			}
			toast.success(`The ${folder ? "folder" : "file"} has been deleted.`, { id: toastId });
		} catch {
			toast.error(`Failed to delete the ${folder ? "folder" : "file"}`, { id: toastId });
		} finally {
			setActionLoading(null);
		}
	};

	const handleHardDelete = async (path: string, folder: boolean) => {
		if (!bedrockClient) return;

		setActionLoading("hardDelete");
		const toastId = toast.loading(`Permanently deleting ${folder ? "folder" : "file"}...`);

		try {
			if (folder) {
				const normalizedFolderPath = normalizePath(path);
				const folderPrefix = normalizedFolderPath.endsWith("/") ? normalizedFolderPath : `${normalizedFolderPath}/`;
				const filesToDelete = files.filter((f) => f.path === normalizedFolderPath || f.path.startsWith(folderPrefix));
				await bedrockClient.files.hardDeleteFiles(filesToDelete.map((f) => f.path));
				hardDeleteFolder(path);
			} else {
				const fileToDelete = files.find((file) => file.path === path);
				if (!fileToDelete) {
					console.error("File not found:", path);
					toast.error("File not found", { id: toastId });
					return;
				}
				await bedrockClient.files.hardDeleteFiles([fileToDelete.path]);
				hardDeleteFile(fileToDelete.path);
			}
			toast.success(`The ${folder ? "folder" : "file"} has been permanently deleted.`, { id: toastId });
		} catch {
			toast.error(`Failed to permanently delete the ${folder ? "folder" : "file"}`, { id: toastId });
		} finally {
			setActionLoading(null);
		}
	};

	const handleMove = async (path: string, newPath: string, folder: boolean) => {
		if (!bedrockClient) return;

		setActionLoading("move");
		newPath = newPath.startsWith("/") ? newPath : `/${newPath}`;

		const sourceParent = getParentPath(path);
		const destParent = getDestinationParent(newPath);
		if (sourceParent === destParent) {
			toast.error("Item is already in this location");
			setFileToMove(null);
			return;
		}

		if (folder) {
			const normalizedSource = normalizePath(path);
			if (destParent.startsWith(normalizedSource)) {
				toast.error("Cannot move folder into itself");
				setFileToMove(null);
				return;
			}
		}

		const toastId = toast.loading(`Moving ${folder ? "folder" : "file"}...`);

		try {
			if (!folder) {
				await bedrockClient.files.moveFiles([
					{
						oldPath: path,
						newPath,
					},
				]);
				moveFile(path, newPath);
			} else {
				const filesToMove = files.filter((f) => f.path.startsWith(path));
				const paths = filesToMove.map((f) => ({
					oldPath: f.path,
					newPath: newPath + f.path.slice(path.length),
				}));
				await bedrockClient.files.moveFiles(paths);
				moveFolder(path, newPath);
			}
			setFileToMove(null);
			toast.success(`The ${folder ? "folder" : "file"} has been moved.`, { id: toastId });
		} catch {
			toast.error(`Failed to move the ${folder ? "folder" : "file"}`, { id: toastId });
		} finally {
			setFileToMove(null);
			setActionLoading(null);
		}
	};

	const handleShare = async (file: FileFullInfo, contact?: Contact) => {
		const toastId = toast.loading(`Sharing file...`);
		try {
			if (contact) {
				await bedrockClient?.files.shareFile(file.path, contact.public_key);
				toast.success(`The file has been shared with contact ${contact.name}.`, { id: toastId });
			} else {
				const hash = await bedrockClient?.files.shareFilePublicly(file, username ?? "Unknown");
				toast.success(`The file has been shared publicly.`, { id: toastId });
				if (hash) setSharedHash(hash);
			}
		} catch (_) {
			toast.error("Unable to share the file", { id: toastId });
		}
		setFileToShare(null);
	};

	const handleRestoreFile = async (path: string) => {
		if (!bedrockClient) return;

		setActionLoading("restore");
		const fileToRestore = files.find((f) => f.path === path);
		if (!fileToRestore) {
			toast.error("File not found");
			return;
		}

		const toastId = toast.loading("Restoring file...");

		try {
			await bedrockClient.files.restoreFiles([fileToRestore.path]);
			restoreFile(path);
			toast.success("File has been restored.", { id: toastId });
		} catch {
			toast.error("Failed to restore file", { id: toastId });
		} finally {
			setActionLoading(null);
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
		const name = path.split("/").pop() || path;
		setFileToCopy({ path, name });
	};

	const handleCopyToDestination = async (destinationPath: string) => {
		if (!fileToCopy || !bedrockClient) return;

		setActionLoading("copy");
		const originalFile = files.find((f) => f.path === fileToCopy.path);
		if (!originalFile) {
			toast.error("File not found");
			setFileToCopy(null);
			return;
		}

		const toastId = toast.loading("Copying file...");
		try {
			const filename = originalFile.path.split("/").pop()!;
			const hasExtension = filename.includes(".");
			const ext = hasExtension ? "." + filename.split(".").pop()! : "";
			const baseName = hasExtension ? filename.slice(0, -ext.length) : filename;

			let copyName = `${baseName}_copy${ext}`;
			let counter = 2;
			while (files.some((f) => f.path === joinPath(destinationPath, copyName))) {
				copyName = `${baseName}_copy_${(counter += 1)}${ext}`;
			}

			const newPath = joinPath(destinationPath, copyName);
			const newFile = await bedrockClient.files.duplicateFile(fileToCopy.path, newPath);
			if (!newFile) {
				throw new Error("File duplication failed");
			}
			setFiles([...files, newFile]);
			setFileToCopy(null);
			toast.success("File copied successfully", { id: toastId });
		} catch {
			toast.error("Failed to copy file", { id: toastId });
		} finally {
			setFileToCopy(null);
			setActionLoading(null);
		}
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

	const hasSelectedFolders = useMemo(() => {
		return Array.from(selectedItems).some((path) => path.endsWith("/"));
	}, [selectedItems]);

	const handleBulkMoveToDestination = async (destinationPath: string) => {
		const normalizedDest = normalizePath(destinationPath);
		let movedCount = 0;
		let skippedCount = 0;

		for (const itemPath of Array.from(selectedItems)) {
			const isFolder = itemPath.endsWith("/");
			const cleanPath = isFolder ? itemPath.slice(0, -1) : itemPath;
			const name = cleanPath.split("/").pop();

			if (!name) {
				skippedCount += 1;
				continue;
			}

			const normalizedSourceParent = normalizePath(getParentPath(cleanPath));
			if (normalizedSourceParent === normalizedDest) {
				skippedCount += 1;
				continue;
			}

			if (isFolder) {
				const normalizedSource = normalizePath(cleanPath);
				if (normalizedDest.startsWith(normalizedSource)) {
					skippedCount += 1;
					continue;
				}
			}

			const newPath = joinPath(normalizedDest, name);
			try {
				await handleMove(cleanPath, newPath, isFolder);
				movedCount += 1;
			} catch (error) {
				console.error("Failed to move item:", error);
				skippedCount += 1;
			}
		}

		setSelectedItems(new Set());
		setBulkMoveMode(false);

		if (skippedCount > 0) {
			toast.success(`Moved ${movedCount} item(s), skipped ${skippedCount} (already in location or invalid)`);
		} else {
			toast.success(`${movedCount} item(s) moved successfully`);
		}
	};

	const handleBulkCopyToDestination = async (destinationPath: string) => {
		if (!bedrockClient) return;

		const normalizedDest = normalizePath(destinationPath);
		const filesToCopy = Array.from(selectedItems).filter((path) => !path.endsWith("/"));
		const newFiles: DriveFile[] = [];
		let skippedCount = 0;

		for (const filePath of filesToCopy) {
			const originalFile = files.find((f) => f.path === filePath);
			if (!originalFile) {
				skippedCount += 1;
				continue;
			}

			const filename = originalFile.path.split("/").pop();
			if (!filename) {
				skippedCount += 1;
				continue;
			}

			const normalizedSourceParent = normalizePath(getParentPath(filePath));
			const hasExtension = filename.includes(".");
			const ext = hasExtension ? "." + filename.split(".").pop()! : "";
			const baseName = hasExtension ? filename.slice(0, -ext.length) : filename;

			let copyName: string;
			if (normalizedSourceParent === normalizedDest) {
				copyName = `${baseName}_copy${ext}`;
			} else {
				copyName = filename;
			}

			let counter = 2;
			while (
				files.some((f) => f.path === joinPath(normalizedDest, copyName)) ||
				newFiles.some((f) => f.path === joinPath(normalizedDest, copyName))
			) {
				counter += 1;
				copyName = `${baseName}_copy_${counter}${ext}`;
			}

			const newPath = joinPath(normalizedDest, copyName);
			try {
				const newFile = await bedrockClient.files.duplicateFile(filePath, newPath);
				if (newFile) newFiles.push(newFile);
			} catch {
				skippedCount += 1;
			}
		}

		setFiles([...files, ...newFiles]);
		setSelectedItems(new Set());
		setBulkCopyMode(false);

		if (skippedCount > 0) {
			toast.success(`Copied ${newFiles.length} file(s), ${skippedCount} failed`);
		} else if (newFiles.length === 0) {
			toast.error("No files were copied");
		} else {
			toast.success(`${newFiles.length} file(s) copied successfully`);
		}
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

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		if (!active || !over || !bedrockClient) return;

		const draggedPath = active.id.toString();
		const targetFolderPath = over.id.toString();

		if (draggedPath !== targetFolderPath) {
			setActionLoading("dragMove");
			const newPath = `${targetFolderPath}/${draggedPath.split("/").pop()}`;
			const toastId = toast.loading("Moving file...");

			try {
				await bedrockClient.files.moveFiles([
					{
						oldPath: draggedPath,
						newPath,
					},
				]);
				moveFile(draggedPath, newPath);
				toast.success("File has been moved.", { id: toastId });
			} catch {
				toast.error("Failed to move file", { id: toastId });
			} finally {
				setActionLoading(null);
			}
		}
	};

	return (
		<div className="flex flex-col" onClick={() => setClickedItem(undefined)}>
			<PublicFileLinkModal hash={sharedHash ?? ""} isOpen={!!sharedHash} onClose={() => setSharedHash(null)} />
			{fileToMove && (
				<FolderBrowserModal
					isOpen={true}
					onClose={() => setFileToMove(null)}
					onComplete={(destinationPath) => {
						handleMove(fileToMove.path, joinPath(destinationPath, fileToMove.name), fileToMove.folder);
						setFileToMove(null);
					}}
					mode="move"
					itemName={fileToMove.name}
					initialPath={currentWorkingDirectory}
					sourcePath={fileToMove.folder ? fileToMove.path : undefined}
				/>
			)}
			{fileToCopy && (
				<FolderBrowserModal
					isOpen={true}
					onClose={() => setFileToCopy(null)}
					onComplete={handleCopyToDestination}
					mode="copy"
					itemName={fileToCopy.name}
					initialPath={currentWorkingDirectory}
				/>
			)}
			{bulkMoveMode && (
				<FolderBrowserModal
					isOpen={true}
					onClose={() => setBulkMoveMode(false)}
					onComplete={handleBulkMoveToDestination}
					mode="move"
					itemName={`${selectedItems.size} item${selectedItems.size > 1 ? "s" : ""}`}
					initialPath={currentWorkingDirectory}
				/>
			)}
			{bulkCopyMode && (
				<FolderBrowserModal
					isOpen={true}
					onClose={() => setBulkCopyMode(false)}
					onComplete={handleBulkCopyToDestination}
					mode="copy"
					itemName={`${selectedItems.size} file${selectedItems.size > 1 ? "s" : ""}`}
					initialPath={currentWorkingDirectory}
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
			{fileToPreview && <FilePreviewDialog file={fileToPreview} isOpen={true} onClose={() => setFileToPreview(null)} />}
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
					{isLoading ? (
						<TableSkeleton columns={5} rows={6} headers={["", "Name", "Size", "Created At", "Actions"]} />
					) : sortedFiles.length === 0 && sortedFolders.length === 0 ? (
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
									{actions.includes("upload") && (
										<div className="flex gap-3 mt-6">
											<label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm cursor-pointer hover:bg-primary/90 transition-colors">
												<Upload size={16} />
												Upload File
												<input {...getInputProps()} className="hidden" />
											</label>
											<Button variant="outline" className="gap-2" onClick={() => setIsCreatingFolder(true)}>
												<FolderPlus size={16} />
												Create Folder
											</Button>
										</div>
									)}
								</>
							)}
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12 pl-4">
										<Checkbox
											checked={selectedItems.size === currentPathFiles.length + currentPathFolders.length}
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
											actions.includes("move")
												? () =>
														setFileToMove({
															path: folder.path,
															folder: true,
															name: folder.path.split("/").filter(Boolean).pop() || folder.path,
														})
												: undefined
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
											actions.includes("move")
												? () =>
														setFileToMove({
															path: file.path,
															folder: false,
															name: file.path.split("/").pop() || file.path,
														})
												: undefined
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
					{actions.includes("bulk") && selectedItems.size > 0 && (
						<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border px-4 md:px-6 py-3 rounded-2xl shadow-lg animate-slide-up max-w-[90vw] md:max-w-fit">
							<div className="flex flex-wrap gap-3 md:gap-6 items-center justify-center">
								<span className="text-sm font-medium whitespace-nowrap text-foreground">
									{selectedItems.size} item{selectedItems.size > 1 ? "s" : ""} selected
								</span>
								<div className="flex items-center gap-1 flex-wrap justify-center">
									<Button
										variant="ghost"
										className="text-sm gap-2"
										disabled={hasSelectedFolders || !!actionLoading}
										onClick={async () => {
											for (const pathFile of Array.from(selectedItems)) {
												const file = files.find((f) => f.path === pathFile);
												if (file) {
													await handleDownloadFile(file);
												}
											}
										}}
									>
										<Download size={16} />
										Download
									</Button>
									<Button
										variant="ghost"
										className="text-sm gap-2"
										disabled={!!actionLoading}
										onClick={() => setBulkMoveMode(true)}
									>
										{actionLoading === "move" ? <Loader2 size={16} className="animate-spin" /> : <Move size={16} />}
										Move
									</Button>
									<Button
										variant="ghost"
										className="text-sm gap-2"
										disabled={hasSelectedFolders || !!actionLoading}
										onClick={() => setBulkCopyMode(true)}
									>
										{actionLoading === "copy" ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />}
										Copy
									</Button>
									<Button
										variant="ghost"
										className="text-sm gap-2 text-destructive hover:text-destructive"
										disabled={!!actionLoading}
										onClick={async () => {
											if (!bedrockClient) return;

											const deletionDatetime = new Date();
											const toastId = toast.loading(`Deleting ${selectedItems.size} item(s)...`);
											let successCount = 0;
											let failCount = 0;

											for (const itemPath of Array.from(selectedItems)) {
												const isFolder = itemPath.endsWith("/");
												const cleanPath = isFolder ? itemPath.slice(0, -1) : itemPath;

												try {
													if (isFolder) {
														const filePathsToDelete = files
															.filter((f) => f.path === cleanPath || f.path.startsWith(cleanPath + "/"))
															.map((f) => f.path);
														await bedrockClient.files.softDeleteFiles(filePathsToDelete, deletionDatetime);
														softDeleteFolder(
															cleanPath,
															deletionDatetime,
															currentWorkingDirectory + cleanPath.slice(0, cleanPath.length).split("/").pop()!,
														);
													} else {
														await bedrockClient.files.softDeleteFiles([cleanPath], deletionDatetime);
														softDeleteFile(cleanPath, deletionDatetime, `/${cleanPath.split("/").pop()!}`);
													}
													successCount += 1;
												} catch (error) {
													console.error("Failed to delete item:", error);
													failCount += 1;
												}
											}

											setSelectedItems(new Set());

											if (failCount > 0) {
												toast.error(`Failed to delete ${failCount} item(s). ${successCount} succeeded.`, {
													id: toastId,
												});
											} else if (successCount > 0) {
												toast.success(`Successfully deleted ${successCount} item(s).`, { id: toastId });
											}
										}}
									>
										{actionLoading === "delete" ? <Loader2 size={16} className="animate-spin" /> : <Trash size={16} />}
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
