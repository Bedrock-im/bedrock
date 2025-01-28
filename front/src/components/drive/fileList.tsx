"use client"

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { FolderIcon, FileText } from "lucide-react";
import { useQueryState } from 'nuqs'
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import "@/app/(drive)/drive.css";
import { DrivePageTitle } from "@/components/drive/drivePageTitle";
import { Card, CardFooter, CardTitle, CardContent } from "@/components/ui/card";
import Draggable from "@/components/ui/draggable";
import DraggableDroppable from "@/components/ui/draggableDroppable";
import useBedrockFileUploadDropzone from "@/hooks/useBedrockFileUploadDropzone";
import { useAccountStore } from "@/stores/account";
import { Permission } from "@/utils/types";


type SortColumn = "name" | "size" | "createdAt" | "permission";
type SortOrder = "asc" | "desc";
type PageType = "My files" | "Trash";

interface FileEntry {
	name: string;
	size: number;
	id: string;
	createdAt: string;
	permission: Permission;
	path: string;
	deleted_at?: string | null;
}

interface FolderEntry {
	name: string;
	path: string;
}

interface FileListProps {
	pageType: PageType;
}

const FileList: React.FC<FileListProps> = ({ pageType }) => {
	const [sortColumn, setSortColumn] = useState<SortColumn>("name");
	const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
	const [countItem, setCountItem] = useState<number>(0);
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
	const [files, setFiles] = useState<FileEntry[]>([]);
	const [folders, setFolders] = useState<FolderEntry[]>([]);
	const [searchQuery, setSearchQuery] = useQueryState("name", {defaultValue: ""})
	const [filteredFiles, setFilteredFiles] = useState<FileEntry[]>([])
	const [filteredFolders, setFilteredFolders] = useState<FolderEntry[]>([])
	const [userPath, setUserPath] = useQueryState("", {defaultValue: ""});


	const bedrockService = useAccountStore((state) => state.bedrockService);

	const { getRootProps, getInputProps } = useBedrockFileUploadDropzone({});

	let clickTimeout: NodeJS.Timeout | null = null;

	const handleMoveFile = async (fileId: string, targetFolderPath: string) => {
		if (!bedrockService) return;
		try {
			const newPath = `${targetFolderPath}${files.find((file) => file.id === fileId)?.name}`;
			const updatedFile = await bedrockService.moveFile(fileId, newPath);

			setFiles((prevFiles) =>
				prevFiles.map((file) => (file.id === fileId ? { ...file, path: updatedFile.path } : file))
			);

			toast.success("File moved successfully!");
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message || "Failed to move file");
			}
			else {
				toast.error("Failed to move file")
			}

		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const draggedId = active.id as string;
			const targetFolderPath = over.id === ".."
				? (() => {
					const parentPath = userPath.split("/").slice(0, -1).join("/") + "/";
					return parentPath || "/";
				})()
				: `${userPath}/${over.id}`;

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
				size: Math.floor(Math.random() * 500) + 100,
				id: entry.post_hash,
				createdAt: new Date().toISOString().split("T")[0],
				permission: "viewer" as Permission,
				path: entry.path,
				deleted_at: null,
			}));

			setFiles(formattedFiles);

			const generatedFolders = generateFoldersFromFiles(formattedFiles);
			setFolders(generatedFolders);
		} catch (error) {
			console.error("Erreur lors de la récupération des fichiers :", error);
		}
	};

	useEffect(() => {
		fetchFiles().then();
	}, [bedrockService]);

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
	}, [bedrockService]);


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

	const handleLeftClick = (name: string) => {
		if (clickTimeout) clearTimeout(clickTimeout);

		clickTimeout = setTimeout(() => {
			setSelectedItems((prevSelectedItems) => {
				const updatedSelectedItems = new Set(prevSelectedItems);

				if (updatedSelectedItems.has(name)) {
					updatedSelectedItems.delete(name);
					setCountItem((prev) => prev - 1);
				} else {
					updatedSelectedItems.add(name);
					setCountItem((prev) => prev + 1);
				}

				return updatedSelectedItems;
			});

			clickTimeout = null;
		}, 200);
	};

	const handleDoubleClick = (name: string) => {
		if (clickTimeout) clearTimeout(clickTimeout);
		if (name === "..") {
			setUserPath((prev) => prev.split("/").slice(0, -1).join("/"));
			return;
		}
		else {
			setUserPath((prev) => `${prev}/${name}`);
		}
		clickTimeout = null;
	};

	return (
		<DndContext onDragEnd={handleDragEnd}>
			<div className="drive-container">
				<div className="search-bar mb-4">
					<input
						type="text"
						placeholder="Search files and folders..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="p-2 border border-gray-300 rounded-lg w-full"
					/>
				</div>
				<div className="drive-content">
					{bedrockService ? (
						<div>
							<DrivePageTitle selectedItemsCount={countItem} onDelete={handleDelete}/>
							<div className="file-list-container">
								<div {...getRootProps()} className="file-upload-dropzone">
									<input {...getInputProps()} />
									<p>Drag & drop some files here, or click to select files</p>
								</div>
								<div className="file-list-header">
									<div onClick={() => handleSort("name")} className="cursor-pointer">
										Name {sortColumn === "name" && (sortOrder === "asc" ? "↑" : "↓")}
									</div>
									<div onClick={() => handleSort("size")} className="cursor-pointer">
										Size {sortColumn === "size" && (sortOrder === "asc" ? "↑" : "↓")}
									</div>
									<div onClick={() => handleSort("createdAt")} className="cursor-pointer">
										Created At {sortColumn === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
									</div>
									<div onClick={() => handleSort("permission")} className="cursor-pointer">
										Permission {sortColumn === "permission" && (sortOrder === "asc" ? "↑" : "↓")}
									</div>
								</div>
								<div className="file-list-content">
									{filteredFolders.length === 0 && filteredFiles.length === 0 ? (
										<div className="no-files-message">
											No files or folders found in this directory.
										</div>
									) : (
										<>
											{filteredFolders.map((folder, index) => (
												<DraggableDroppable key={index} id={folder.name} onDrop={handleDragEnd}>
													<Card
														key={index}
														className={`file-list-item`}
														onClick={() => handleLeftClick(folder.name)}
														onDoubleClick={() => handleDoubleClick(folder.name)}
													>
														<CardTitle className="flex items-center">
															<FolderIcon className="folder-icon" />
															<span className="folder-name">{folder.name}</span>
														</CardTitle>
														<CardContent>-</CardContent>
														<CardContent>-</CardContent>
														<CardFooter>-</CardFooter>
													</Card>
												</DraggableDroppable>
											))}
											{filteredFiles.map((file) => (
												<Draggable key={file.id} id={file.id}>
													<Card
														key={file.id}
														className={`file-list-item`}
														onClick={() => handleLeftClick(file.name)}
													>
														<CardTitle className="flex items-center">
															<FileText className="file-icon" />
															<span className="file-name">{file.name}</span>
														</CardTitle>
														<CardContent className="file-size">{file.size} KB</CardContent>
														<CardContent>{file.createdAt}</CardContent>
														<CardFooter>{file.permission}</CardFooter>
													</Card>
												</Draggable>
											))}
										</>
									)}
								</div>
							</div>
						</div>
					) : (
						<p>could not connect please try later</p>
					)}
				</div>
			</div>
		</DndContext>
	);
};

export default FileList;
