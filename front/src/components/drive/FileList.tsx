"use client";

import { useQueryState } from "nuqs";
import React, { useEffect, useState } from "react";

import { DrivePageTitle } from "@/components/drive/DrivePageTitle";
import FileCard from "@/components/drive/FileCard";

import useBedrockFileUploadDropzone from "@/hooks/useBedrockFileUploadDropzone";
import { useAccountStore } from "@/stores/account";
import { useDriveStore } from "@/stores/drive";

import UploadButton from "./UploadButton";

type SortColumn = "path" | "size" | "created_at";
type SortOrder = "asc" | "desc";
type PageType = "My files" | "Trash | Shared";

export type FileListProps = {
	pageType: PageType;
};

const FileList: React.FC<FileListProps> = () => {
	const [searchQuery, setSearchQuery] = useQueryState("name", { defaultValue: "" });
	const [, setCurrentWorkingDirectoryUrl] = useQueryState("cwd", { defaultValue: "/" });
	const [sortColumn, setSortColumn] = useState<SortColumn>("path");
	const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
	const [countItem, setCountItem] = useState<number>(0);
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
	const {
		files,
		folders,
		setFiles,
		setFolders,
		deleteFile,
		addFolder,
		deleteFolder,
		moveFile,
		moveFolder,
		currentWorkingDirectory,
		changeCurrentWorkingDirectory,
	} = useDriveStore();
	const { bedrockService } = useAccountStore();
	const { getInputProps } = useBedrockFileUploadDropzone({});

	let clickTimeout: NodeJS.Timeout | null = null;
	const cwdRegex = `^${currentWorkingDirectory.replace("/", "\\/")}[^ \\/]+$`;
	const filteredFiles = files.filter(
		(file) => file.path.match(cwdRegex) && file.path.toLowerCase().includes(searchQuery.toLowerCase()),
	);
	const filteredFolders = folders.filter(
		(folder) =>
			folder.path.match(cwdRegex) &&
			folder.path !== currentWorkingDirectory && // Don't show the current directory
			folder.path.toLowerCase().includes(searchQuery.toLowerCase()),
	);

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

	const handleDownloadFile = async (filePath: string) => {
		if (!bedrockService) return;

		try {
			const fileEntries = await bedrockService.fetchFileEntries();
			const file = fileEntries.find((entry) => entry.path === filePath);

			if (!file) {
				console.error("File not found:", filePath);
				return;
			}

			const fileData = await bedrockService.fetchFilesMetaFromEntries(file);
			const buffer = await bedrockService.downloadFileFromStoreHash(
				fileData[0].store_hash,
				fileData[0].key,
				fileData[0].iv,
			);
			const blob = new Blob([buffer], { type: "application/octet-stream" });
			const url = URL.createObjectURL(blob);

			const link = document.createElement("a");
			link.href = url;
			link.download = filePath.split("/").pop() || "downloaded-file";
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

		if (folders.some((folder) => folder.path === newFolderPath)) {
			alert("This folder already exists!");
			return;
		}

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
			const hash = deleteFile(path);
			if (hash) bedrockService?.hardDeleteFiles({ path, store_hash: hash });
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

	const handleGoBackOneDirectory = () => {
		const newPath = currentWorkingDirectory.slice(0, -1).split("/").slice(0, -1).join("/") || "/";
		changeCurrentWorkingDirectory(newPath);
		setCurrentWorkingDirectoryUrl(newPath);
	};

	const handleGoToDirectory = (path: string) => {
		if (path === "..") {
			handleGoBackOneDirectory();
			return;
		}
		changeCurrentWorkingDirectory(path);
		setCurrentWorkingDirectoryUrl(path);
	};

	return (
		<div className="flex flex-col h-screen bg-gray-200">
			{bedrockService ? (
				<>
					<div className="ml-8 mt-2 mb-4 mr-5">
						<input
							type="text"
							placeholder="Search files and folders..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value || null)}
							className="p-2 border border-gray-300 rounded-lg w-full"
						/>
					</div>

					<div className="flex-1 p-4 w-full">
						<div className="flex justify-between items-center px-8">
							<UploadButton onCreateFolder={handleCreateFolder} getInputProps={getInputProps} />
							<input type="file" id="fileInput" className="hidden" onChange={() => {}} />
						</div>

						<DrivePageTitle selectedItemsCount={countItem} onDelete={() => {}} />

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
											changeCurrentWorkingDirectory(currentWorkingDirectory.split("/").slice(0, -1).join("/") || "/")
										}
									/>
								)}

								{filteredFolders.map((folder) => (
									<FileCard
										metadata={folder}
										folder
										key={folder.path}
										selected={selectedItems.has(folder.path)}
										onLeftClick={() => handleGoToDirectory(folder.path)}
										onRename={() => handleRename(folder.path, true)}
										onDelete={() => handleDelete(folder.path, true)}
										onMove={() => handleMove(folder.path, true)}
									/>
								))}

								{filteredFiles.map((file) => (
									<FileCard
										metadata={file}
										key={file.path}
										selected={selectedItems.has(file.path)}
										onLeftClick={() => handleLeftClick(file.path)}
										onRename={() => handleRename(file.path, false)}
										onDelete={() => handleDelete(file.path, false)}
										onMove={() => handleMove(file.path, false)}
										onDownload={() => handleDownloadFile(file.path)}
									/>
								))}
							</div>
						</div>
					</div>
				</>
			) : (
				<div className="flex items-center justify-center h-screen">
					<div className="text-2xl font-semibold">Loading...</div>
				</div>
			)}
		</div>
	);
};

export default FileList;
