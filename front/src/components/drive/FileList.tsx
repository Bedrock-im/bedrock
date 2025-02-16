"use client";

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { FolderIcon, FileText } from "lucide-react";
import { useQueryState } from 'nuqs'
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import "@/app/(drive)/drive.css";
import { DrivePageTitle } from "@/components/drive/DrivePageTitle";
import FileCard from "@/components/drive/FileCard";
import { Card, CardFooter, CardTitle, CardContent } from "@/components/ui/card";
import Draggable from "@/components/ui/draggable";
import DraggableDroppable from "@/components/ui/draggableDroppable";
import useBedrockFileUploadDropzone from "@/hooks/useBedrockFileUploadDropzone";
import { useAccountStore } from "@/stores/account";
import { DriveFile, DriveFolder, useDriveStore } from "@/stores/drive";

type SortColumn = "path" | "size" | "created_at";
type SortOrder = "asc" | "desc";

export type FileListProps = {
	files: DriveFile[];
	folders: DriveFolder[];
};

const FileList: React.FC<FileListProps> = ({ files, folders }) => {
	const [sortColumn, setSortColumn] = useState<SortColumn>("path");
	const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
	const [countItem, setCountItem] = useState<number>(0);
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
	const { deleteFile, deleteFolder, moveFile, moveFolder, currentWorkingDirectory, changeCurrentWorkingDirectory } =
		useDriveStore();
	const { bedrockService } = useAccountStore();

	const { getRootProps, getInputProps } = useBedrockFileUploadDropzone({});

	let clickTimeout: NodeJS.Timeout | null = null;



	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			console.log("active", active);
			const draggedId = active.id as string;
			const targetFolderPath = over.id === ".."
				? (() => {
					const parentPath = userPath.split("/").slice(0, -1).join("/") + "/";
					return parentPath || "/";
				})()
				: `${userPath}/${over.id}/`;

			const draggedFolder = folders.find((folder) => folder.name === draggedId);
			const draggedFile = files.find((file) => file.id === draggedId);

			if (draggedFolder) {
				const folderPath = draggedFolder.path;
				const itemsToMove = files.filter((file) => file.path.startsWith(folderPath));
				const foldersToMove = folders.filter((folder) => folder.path.startsWith(folderPath));

				itemsToMove.forEach((file) => {
					const newFilePath = file.path.replace(folderPath, targetFolderPath);
					handleMoveFile(file.id, newFilePath).then();
				});

				foldersToMove.forEach((folder) => {
					const newFolderPath = folder.path.replace(folderPath, targetFolderPath);
					setFolders((prevFolders) =>
						prevFolders.map((f) => (f.path === folder.path ? { ...f, path: newFolderPath } : f))
					);
				});
			} else if (draggedFile) {
				handleMoveFile(draggedFile.id, targetFolderPath).then();
			}
		}
	};


	const fetchFiles = async () => {
		if (!bedrockService) {
			return;
		}

		try {
			const fileEntries = await bedrockService.fetchFileEntries();
			const formattedFiles = fileEntries.map((entry) => ({
				name: entry.path.split("/").pop() || "Unnamed file",
				size: 0,
				id: entry.post_hash,
				createdAt: new Date().toISOString().split("T")[0],
				permission: "viewer" as Permission,
				path: entry.path,
				deleted_at: entry.deleted_at,
			}));

			setFiles(formattedFiles);

			const generatedFolders = generateFoldersFromFiles(formattedFiles);
			setFolders(generatedFolders);
		} catch (error) {
			console.error("Erreur lors de la récupération des fichiers :", error);
		}
	};


	const generateFoldersFromFiles = (fileEntries: FileEntry[]): FolderEntry[] => {
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

		return Array.from(folderPaths)
			.filter((path) => path !== "/")
			.map((path) => ({
				name: path.split("/").pop() || "",
				path,
			}));
	};

	const handleDelete = () => {
		alert("Delete");
	}

	const filterFilesByPageType = () => {
		if (pageType === "Trash") {
			return files.filter((file) => file.deleted_at);
		} else if (pageType === "My files") {
			return files.filter((file) => !file.deleted_at);
		}
		return files;
	};

	useEffect(() => {
		fetchFiles();
	}, [files]);


	const handleDownloadFile = async (fileId: string, fileName: string) => {
		if (!bedrockService) return;

		try {
			const fileBuffer = await bedrockService.alephService.downloadFile(fileId);
			const blob = new Blob([fileBuffer], { type: "application/octet-stream" });
			const url = URL.createObjectURL(blob);

			const link = document.createElement("a");
			link.href = url;
			link.download = fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			toast.success("Téléchargement réussi !");
		} catch (error) {
			console.error("Erreur lors du téléchargement :", error);
			toast.error("Échec du téléchargement.");
		}
	};


	const filterFilesAndFolders = () => {
		const filteredByPageType = filterFilesByPageType();

		const finalFilteredFiles = filteredByPageType.filter(
			(file) =>
				file.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
				(userPath === "/" ? file.path.split("/").length === 2 : file.path.startsWith(userPath) &&
					file.path.split("/").length === userPath.split("/").length + 1)
		);

		const finalFilteredFolders = folders.filter(
			(folder) =>
				folder.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
				(userPath === "/" ? folder.path.split("/").length === 2 : folder.path.startsWith(userPath) &&
					folder.path.split("/").length === userPath.split("/").length + 1)
		);

		if (userPath && userPath !== "/") {
			finalFilteredFolders.unshift({
				name: "..",
				path: userPath.split("/").slice(0, -1).join("/") || "/",
			});
		}

		setFilteredFiles(finalFilteredFiles);
		setFilteredFolders(finalFilteredFolders);
	};


	useEffect(() => {
		filterFilesAndFolders();
	}, [searchQuery, files, folders, userPath]);


	const handleSort = (column: SortColumn) => {
		if (sortColumn === column) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortColumn(column);
			setSortOrder("asc");
		}
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
	};

	const handleGoToDirectory = (path: string) => {
		changeCurrentWorkingDirectory(path);
	};

	const sortedFiles = [...files].sort((a, b) => {
		const isAscending = sortOrder === "asc" ? 1 : -1;
		if (a[sortColumn] < b[sortColumn]) return -1 * isAscending;
		if (a[sortColumn] > b[sortColumn]) return 1 * isAscending;
		return 0;
	});

	const sortedFolders = [...folders].sort(() => {
		return 0;
	});

	return (
		<div>
			<DrivePageTitle selectedItemsCount={countItem} />
			<div className="file-list-container">
				<div {...getRootProps()} className="file-upload-dropzone">
					<input {...getInputProps()} />
					<p>Drag & drop some files here, or click to select files</p>
				</div>
				<div className="file-list-header">
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

				<div className="file-list-content">
					{currentWorkingDirectory !== "/" && (
						<FileCard
							folder
							metadata={{ path: "..", created_at: new Date().toISOString(), deleted_at: null }}
							onLeftClick={handleGoBackOneDirectory}
						/>
					)}
					{sortedFolders.map((folder) => (
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

					{sortedFiles.map((file) => (
						<FileCard
							metadata={file}
							key={file.path}
							selected={selectedItems.has(file.path)}
							onLeftClick={() => handleLeftClick(file.path)}
							onRename={() => handleRename(file.path, false)}
							onDelete={() => handleDelete(file.path, false)}
							onMove={() => handleMove(file.path, false)}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default FileList;
