"use client";

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { LoaderIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import React, { useEffect, useMemo, useState } from "react";

import CurrentPath from "@/components/drive/CurrentPath";
import FileCard from "@/components/drive/FileCard";
import SortOption from "@/components/drive/SortOption";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useBedrockFileUploadDropzone from "@/hooks/use-bedrock-file-upload-dropzone";
import { FileFullInfos } from "@/services/bedrock";
import { useAccountStore } from "@/stores/account";
import { DriveFile, DriveFolder, useDriveStore } from "@/stores/drive";

import UploadButton from "./UploadButton";
import {toast} from "sonner";
import {FileRenameModal} from "@/components/FileRenameModal";

type SortColumn = "path" | "size" | "created_at";
type SortOrder = "asc" | "desc";

type FileListProps = {
	files?: DriveFile[];
	folders?: DriveFolder[];
	actions?: ("upload" | "rename" | "download" | "delete" | "share" | "move" | "restore" | "hardDelete")[];
	defaultCwd?: string;
	defaultSearchQuery?: string;
	onSelectedItemPathsChange?: (selectedItemPaths: Set<string>) => void;
	selectedPaths?: string[];
	trash?: boolean;
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
}) => {
	const [searchQuery, setSearchQuery] = useQueryState("search", { defaultValue: defaultSearchQuery });
	const [currentWorkingDirectory, setCurrentWorkingDirectory] = useQueryState("cwd", {
		defaultValue: defaultCwd,
		history: "push",
	});
	const [fileToRename, setFileToRename]	= useState<FileFullInfos | null>(null);
	const [sortColumn, setSortColumn] = useQueryState("sort", { defaultValue: "path" as SortColumn });
	const [sortOrder, setSortOrder] = useQueryState("order", { defaultValue: "asc" as SortOrder });
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(selectedPaths));
	const [clickedItem, setClickedItem] = useState<string>();
	const {
		setFiles,
		setFolders,
		softDeleteFile,
		addFolder,
		deleteFolder,
		moveFile,
		moveFolder,
		restoreFile,
		files,
		folders,
		setSharedFiles,
		setContacts,
		contacts,
	} = useDriveStore();
	const { bedrockService } = useAccountStore();
	const { getInputProps } = useBedrockFileUploadDropzone({});

	const cwdRegex = `^${currentWorkingDirectory.replace("/", "\\/")}[^ \\/]+$`;

	const currentPathFiles = (propFiles ?? files).filter(
		(file) =>
			file.path.match(cwdRegex) &&
			file.path.toLowerCase().includes(searchQuery.toLowerCase()) &&
			(trash ? file.deleted_at !== null : file.deleted_at === null),
	);

	const currentPathFolders = (propFolders ?? folders).filter(
		(folder) =>
			folder.path.match(cwdRegex) &&
			folder.path !== currentWorkingDirectory && // Don't show the current directory
			folder.path.toLowerCase().includes(searchQuery.toLowerCase()) &&
			(trash ? folder.deleted_at !== null : folder.deleted_at === null),
	);

	useEffect(() => {
		if (!bedrockService) {
			return;
		}

		(async () => {
			try {
				const fileEntries = await bedrockService.fetchFileEntries();
				const fullFiles = await bedrockService.fetchFilesMetaFromEntries(fileEntries);
				const contacts = await bedrockService.fetchContacts();
				const sharedFilesByContacts = await Promise.all(
					contacts.map((c) => bedrockService.fetchFilesSharedByContact(c)),
				);
				const sharedFiles = sharedFilesByContacts.flat();

				const folderPaths = new Set<string>();

				fileEntries.forEach((file) => {
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
				]);
				setSharedFiles(sharedFiles);
				setContacts(contacts);
			} catch (error) {
				console.error("Failed to fetch files:", error);
			}
		})();
	}, [bedrockService, setFolders, setFiles, setSharedFiles, setContacts]);

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

	const handleDownloadFile = async (file: DriveFile) => {
		if (!bedrockService) return;

		try {
			const buffer = await bedrockService.downloadFileFromStoreHash(file.store_hash, file.key, file.iv);
			const blob = new Blob([buffer], { type: "application/octet-stream" });
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

	const handleCreateFolder = () => {
		const folderName = prompt("Enter folder name");
		if (!folderName) return;

		const newFolderPath = `${currentWorkingDirectory}${folderName}`;

		// TODO: this check should be moved to the drive or bedrock service to check against all files, not just those passed to this component
		// if (folders.some((folder) => folder.path === newFolderPath)) {
		// 	toast.error("This folder already exists!");
		// 	return;
		// }

		const newFolder: DriveFolder = {
			path: newFolderPath,
			created_at: new Date().toISOString(),
			deleted_at: null,
			shared_with: [],
			shared_keys: {},
		};

		addFolder(newFolder);

		toast.success(`The folder "${folderName}" has been created.`);
	};

	const handleRename = (path: string, folder: boolean, newName: string) => {
		const newPath = `${path.split("/").slice(0, -1).join("/")}/${newName}`;

		if (!folder) {
			moveFile(path, newPath);
			bedrockService?.moveFile(path, newPath);
		} else {
			const filesToMove = moveFolder(path, newPath);
			filesToMove.map(([oldFile, newFile]) => bedrockService?.moveFile(oldFile.path, newFile.path));
		}
	};

	const handleSoftDelete = (path: string, folder: boolean) => {
		if (folder) {
			const filesToDelete = deleteFolder(path);
			bedrockService?.hardDeleteFiles(...filesToDelete);
		} else {
			const deletionDatetime = new Date();
			const hash = softDeleteFile(path, deletionDatetime);
			if (hash) bedrockService?.softDeleteFile({ post_hash: hash }, deletionDatetime);
		}
	};

	const handleHardDelete = (path: string, folder: boolean) => {
		if (folder) {
			const filesToDelete = deleteFolder(path);
			bedrockService?.hardDeleteFiles(...filesToDelete);
		} else {
			const fileToDelete = files.find((file) => file.path === path);
			if (!fileToDelete) {
				console.error("File not found:", path);
				return;
			}
			bedrockService?.hardDeleteFiles(fileToDelete);
		}
	};

	const handleMove = (path: string, folder: boolean) => {
		const newPath = prompt("Enter new path", path);

		if (!newPath) {
			return;
		}

		if (!folder) {
			moveFile(path, newPath);
			bedrockService?.moveFile(path, newPath);
		} else {
			const filesToMove = moveFolder(path, newPath);
			filesToMove.map(([oldFile, newFile]) => bedrockService?.moveFile(oldFile.path, newFile.path));
		}
	};

	const handleShare = (file: FileFullInfos) => {
		const contactName = prompt("Enter the contact you want to share this file with:");
		if (!contactName) {
			return;
		}

		const contact = contacts.find((contact) => contact.name === contactName);
		if (!contact) {
			toast.error("Contact not found");
			return;
		}

		bedrockService?.shareFileWithContact(file, contact.public_key);
	};

	const handleRestoreFile = (path: string) => {
		const hash = restoreFile(path);
		if (hash) bedrockService?.restoreFile({ post_hash: hash });
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

	if (!bedrockService) {
		return (
			<div className="flex items-center justify-center h-screen">
				<LoaderIcon className="animate-spin m-auto h-[100vh]" />
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
			bedrockService?.moveFile(draggedPath, newPath);
		}
	};

	return (
		<div className="flex flex-col h-full bg-gray-200" onClick={() => setClickedItem(undefined)}>
			<FileRenameModal isOpen={!!fileToRename} onComplete={(newName) => handleRename(fileToRename?.path ?? "/", false, newName)} name={fileToRename?.name} />
			<div className="flex justify-between items-center m-2 gap-4">
				{actions.includes("upload") && (
					<UploadButton onCreateFolder={handleCreateFolder} getInputProps={getInputProps} />
				)}
				<input type="file" id="fileInput" className="hidden" onChange={() => {}} />
				<input
					type="text"
					placeholder="Search files and folders..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value || null)}
					className="p-2 border border-gray-300 rounded-lg w-full"
				/>
			</div>

			<Card className="m-2 pb-2 gap-y-4">
				<div className="m-4 mt-2">
					<CurrentPath path={currentWorkingDirectory} setPath={setCurrentWorkingDirectory} />
					<Separator orientation="horizontal" />
				</div>
				<DndContext onDragEnd={handleDragEnd}>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[40px]">
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
									onDoubleClick={() => setCurrentWorkingDirectory(folder.path + "/")}
									onDelete={actions.includes("delete") ? () => handleSoftDelete(folder.path, true) : undefined}
									onHardDelete={actions.includes("hardDelete") ? () => handleHardDelete(folder.path, true) : undefined}
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
									onDownload={actions.includes("download") ? () => handleDownloadFile(file) : undefined}
									onShare={actions.includes("share") ? () => handleShare(file) : undefined}
									onRename={actions.includes("rename") ? () => setFileToRename(file) : undefined}
									onMove={actions.includes("move") ? () => handleMove(file.path, false) : undefined}
									onDelete={actions.includes("delete") ? () => handleSoftDelete(file.path, false) : undefined}
									onHardDelete={actions.includes("hardDelete") ? () => handleHardDelete(file.path, false) : undefined}
									onRestore={actions.includes("restore") ? () => handleRestoreFile(file.path) : undefined}
								/>
							))}
						</TableBody>
					</Table>
				</DndContext>
			</Card>
		</div>
	);
};

export default FileList;
