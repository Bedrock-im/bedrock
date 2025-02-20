"use client";

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
import useBedrockFileUploadDropzone from "@/hooks/useBedrockFileUploadDropzone";
import { useAccountStore } from "@/stores/account";
import { DriveFile, DriveFolder, useDriveStore } from "@/stores/drive";

import UploadButton from "./UploadButton";

type SortColumn = "path" | "size" | "created_at";
type SortOrder = "asc" | "desc";

type FileListProps = {
	files: DriveFile[];
	folders: DriveFolder[];
	actions: Set<"rename" | "download" | "delete" | "move" | "restore">;
};

const FileList: React.FC<FileListProps> = ({ files, folders, actions }) => {
	const [searchQuery, setSearchQuery] = useQueryState("search", { defaultValue: "" });
	const [currentWorkingDirectory, setCurrentWorkingDirectory] = useQueryState("cwd", { defaultValue: "/" });
	const [sortColumn, setSortColumn] = useQueryState("sort", { defaultValue: "path" as SortColumn });
	const [sortOrder, setSortOrder] = useQueryState("order", { defaultValue: "asc" as SortOrder });
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
	const [clickedItem, setClickedItem] = useState<string>();
	const { setFiles, setFolders, softDeleteFile, restoreFile, addFolder, deleteFolder, moveFile, moveFolder } =
		useDriveStore();
	const { bedrockService } = useAccountStore();
	const { getInputProps } = useBedrockFileUploadDropzone({});

	useEffect(() => {
		if (!bedrockService) {
			return;
		}

		(async () => {
			try {
				const fileEntries = await bedrockService.fetchFileEntries();
				const fullFiles = await bedrockService.fetchFilesMetaFromEntries(...fileEntries);

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
						})),
				]);
			} catch (error) {
				console.error("Failed to fetch files:", error);
			}
		})();
	}, [bedrockService, setFolders, setFiles]);

	const { sortedFiles, sortedFolders } = useMemo(
		() => ({
			sortedFiles: files.sort((a, b) => {
				if (sortColumn === "size") {
					return (a.size - b.size) * (sortOrder === "asc" ? 1 : -1);
				} else if (sortColumn === "created_at") {
					return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * (sortOrder === "asc" ? 1 : -1);
				}
				return a.path.localeCompare(b.path) * (sortOrder === "asc" ? 1 : -1);
			}),
			sortedFolders: folders.sort((a, b) => {
				if (sortColumn === "created_at") {
					return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * (sortOrder === "asc" ? 1 : -1);
				}
				return a.path.localeCompare(b.path) * (sortOrder === "asc" ? 1 : -1);
			}),
		}),
		[files, folders, sortColumn, sortOrder],
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
			console.error("Failed to download file:", error);
		}
	};

	const handleCreateFolder = () => {
		const folderName = prompt("Enter folder name");
		if (!folderName) return;

		const newFolderPath = `${currentWorkingDirectory}/${folderName}`;

		// TODO: this check should be moved to the drive or bedrock service to check against all files, not just those passed to this component
		// if (folders.some((folder) => folder.path === newFolderPath)) {
		// 	alert("This folder already exists!");
		// 	return;
		// }

		const newFolder = {
			path: newFolderPath,
			created_at: new Date().toISOString(),
			deleted_at: null,
		};

		addFolder(newFolder);

		alert(`The folder "${folderName}" has been created locally. It will only be saved if a file is moved inside.`);
	};

	const handleRename = (path: string, folder: boolean) => {
		const newName = prompt(`Enter new ${folder ? "folder" : "file"} name`, path.split("/").pop());
		if (!newName) {
			return;
		}

		const newPath = `${path.split("/").slice(0, -1).join("/")}/${newName}`;

		if (!folder) {
			moveFile(path, newPath);
			bedrockService?.moveFile(path, newPath);
		} else {
			const filesToMove = moveFolder(path, newPath);
			filesToMove.map(([oldFile, newFile]) => bedrockService?.moveFile(oldFile.path, newFile.path));
		}
	};

	const handleDelete = (path: string, folder: boolean) => {
		if (folder) {
			const filesToDelete = deleteFolder(path);
			bedrockService?.hardDeleteFiles(...filesToDelete);
		} else {
			const deletionDatetime = new Date();
			const hash = softDeleteFile(path, deletionDatetime);
			if (hash) bedrockService?.softDeleteFile({ post_hash: hash }, deletionDatetime);
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

	/*
	const handleRestoreFile = (path: string) => {
		const hash = restoreFile(path);
		if (hash) bedrockService?.restoreFile({ post_hash: hash });
	};
	 */

	const selectItem = (path: string) => {
		setSelectedItems((prev) => {
			const updated = new Set(prev);
			if (updated.has(path)) {
				updated.delete(path);
			} else {
				updated.add(path);
			}
			return updated;
		});
	};

	const selectAll = () => {
		setSelectedItems(() => {
			if (selectedItems.size === files.length + folders.length) {
				return new Set();
			}

			const updated = new Set<string>();
			files.forEach((file) => updated.add(file.path));
			folders.forEach((folder) => updated.add(folder.path));
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

	return (
		<div className="flex flex-col h-screen bg-gray-200" onClick={() => setClickedItem(undefined)}>
			<div className="flex justify-between items-center m-2 gap-4">
				<UploadButton onCreateFolder={handleCreateFolder} getInputProps={getInputProps} />
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
								selected={selectedItems.has(folder.path)}
								setSelected={() => selectItem(folder.path)}
								onLeftClick={() => setClickedItem(folder.path)}
								onDoubleClick={() => setCurrentWorkingDirectory(folder.path + "/")}
								onDelete={actions.has("delete") ? () => handleDelete(folder.path, true) : undefined}
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
								onDownload={actions.has("download") ? () => handleDownloadFile(file) : undefined}
								onRename={actions.has("rename") ? () => handleRename(file.path, false) : undefined}
								onMove={actions.has("move") ? () => handleMove(file.path, false) : undefined}
								onDelete={actions.has("delete") ? () => handleDelete(file.path, false) : undefined}
							/>
						))}
					</TableBody>
				</Table>
			</Card>
		</div>
	);
};

export default FileList;
