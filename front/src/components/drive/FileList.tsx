"use client";

import { LoaderIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import React, { useEffect, useState } from "react";

import { DrivePageTitle } from "@/components/drive/DrivePageTitle";
import FileCard from "@/components/drive/FileCard";
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
	const [countItem, setCountItem] = useState<number>(0);
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
	const { setFiles, setFolders, softDeleteFile, restoreFile, addFolder, deleteFolder, moveFile, moveFolder } =
		useDriveStore();
	const { bedrockService } = useAccountStore();
	const { getInputProps } = useBedrockFileUploadDropzone({});

	let clickTimeout: NodeJS.Timeout | null = null;

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

	const handleSort = (column: SortColumn) => {
		if (sortColumn === column) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortColumn(column);
			setSortOrder("asc");
		}
	};

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

	const handleLeftClick = (path: string) => {
		if (clickTimeout) clearTimeout(clickTimeout);

		clickTimeout = setTimeout(() => {
			setSelectedItems((prevSelectedItems) => {
				const updatedSelectedItems = new Set(prevSelectedItems);

				if (updatedSelectedItems.has(path)) {
					updatedSelectedItems.delete(path);
					setCountItem(countItem - 1);
				} else {
					updatedSelectedItems.add(path);
					setCountItem(countItem + 1);
				}

				return updatedSelectedItems;
			});

			clickTimeout = null;
		}, 200);
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

	const handleRestoreFile = (path: string) => {
		const hash = restoreFile(path);
		if (hash) bedrockService?.restoreFile({ post_hash: hash });
	};

	const handleGoBackOneDirectory = () => {
		const newPath = currentWorkingDirectory.slice(0, -1).split("/").slice(0, -1).join("/") || "/";
		setCurrentWorkingDirectory(newPath);
	};

	const handleGoToDirectory = (path: string) => {
		if (path === "..") {
			handleGoBackOneDirectory();
			return;
		}
		setCurrentWorkingDirectory(path);
	};

	if (!bedrockService) {
		return (
			<div className="flex items-center justify-center h-screen">
				<LoaderIcon className="animate-spin m-auto h-[100vh]" />
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen bg-gray-200">
			<>
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
				<div className="flex-1 p-4 w-full">
					<DrivePageTitle cwd={currentWorkingDirectory} selectedItemsCount={countItem} onDelete={() => {}} />
					<div className="flex flex-col flex-1 w-full overflow-hidden">
						<div className="grid grid-cols-4 gap-4 mb-4 font-semibold text-gray-600">
							<div onClick={() => handleSort("path")} className="cursor-pointer">
								Name {sortColumn === "path" && (sortOrder === "asc" ? "↑" : "↓")}
							</div>
							<div onClick={() => handleSort("size")} className="cursor-pointer">
								Size {sortColumn === "size" && (sortOrder === "asc" ? "↑" : "↓")}
							</div>
							<div onClick={() => handleSort("created_at")} className="cursor-pointer">
								Created At {sortColumn === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
							</div>
						</div>

						<div className="overflow-y-auto">
							{currentWorkingDirectory !== "/" && (
								<FileCard
									folder
									metadata={{ path: "..", created_at: new Date().toISOString(), deleted_at: null }}
									onLeftClick={() =>
										setCurrentWorkingDirectory(currentWorkingDirectory.split("/").slice(0, -1).join("/") || "/")
									}
								/>
							)}

							{/*TODO: concat both lists and show them together, so it can be sorted by name*/}
							{folders.map((folder) => (
								<FileCard
									metadata={folder}
									folder
									key={folder.path}
									selected={selectedItems.has(folder.path)}
									onLeftClick={() => handleGoToDirectory(folder.path)}
									onRename={actions.has("rename") ? () => handleRename(folder.path, true) : undefined}
									onDelete={actions.has("delete") ? () => handleDelete(folder.path, true) : undefined}
									onMove={actions.has("move") ? () => handleMove(folder.path, true) : undefined}
								/>
							))}

							{files.map((file) => (
								<FileCard
									metadata={file}
									key={file.path}
									selected={selectedItems.has(file.path)}
									onLeftClick={() => handleLeftClick(file.path)}
									onRename={actions.has("rename") ? () => handleRename(file.path, false) : undefined}
									onDelete={actions.has("delete") ? () => handleDelete(file.path, false) : undefined}
									onMove={actions.has("move") ? () => handleMove(file.path, false) : undefined}
									onDownload={actions.has("download") ? () => handleDownloadFile(file) : undefined}
									onRestore={actions.has("restore") ? () => handleRestoreFile(file.path) : undefined}
								/>
							))}
						</div>
					</div>
				</div>
			</>
		</div>
	);
};

export default FileList;
