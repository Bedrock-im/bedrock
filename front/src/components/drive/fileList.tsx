
"use client"

import { FolderIcon, FileText } from "lucide-react";
import React, { useEffect, useState } from "react";

import "@/app/(drive)/drive.css";
import { DrivePageTitle } from "@/components/drive/drivePageTitle";
import { Card, CardFooter, CardTitle, CardContent } from "@/components/ui/card";
import useBedrockFileUploadDropzone from "@/hooks/useBedrockFileUploadDropzone";
import BedrockService from "@/services/bedrock";
import { useAccountStore } from "@/stores/account";
import { Permission } from "@/utils/types";

type SortColumn = "name" | "size" | "createdAt" | "permission";
type SortOrder = "asc" | "desc";
type Page = "My files" | "Shared with me" | "Trash";


const FileList: React.FC = ({ }) => {
	const [sortColumn, setSortColumn] = useState<SortColumn>("name");
	const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
	const [countItem, setCountItem] = useState<number>(0);
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
	const [files, setFiles] = useState<
		{ name: string; size: number; id: string; createdAt: string; permission: Permission; path: string }[]
	>([]);
	const [folders, setFolders] = useState<{ name: string; permission: Permission; path: string }[]>([]);
	const [searchQuery, setSearchQuery] = useState<string>("");

	const bedrockService = useAccountStore((state) => state.bedrockService);

	const { getRootProps, getInputProps } = useBedrockFileUploadDropzone({});

	let clickTimeout: NodeJS.Timeout | null = null;

	const fetchFiles =  async () => {
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
			}));

			setFiles(formattedFiles);
			setFolders([{ name: "Folder 1", permission: "viewer", path: "/folder1" }]);
		} catch (error) {
			console.error("Erreur lors de la récupération des fichiers :", error);
		}
	};

	const fileSelection = () => {

	}

	useEffect(() => {
		fetchFiles().then(() => {
			console.log("Fichiers récupérés", files);
		});
	}, [bedrockService]);

	const handleSort = (column: SortColumn) => {
		if (sortColumn === column) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortColumn(column);
			setSortOrder("asc");
		}
	};

	const handleDelete = () => {
		alert("Delete");
	}

	const handleLeftClick = (name: string) => {
		if (clickTimeout) clearTimeout(clickTimeout);

		clickTimeout = setTimeout(() => {
			setSelectedItems((prevSelectedItems) => {
				const updatedSelectedItems = new Set(prevSelectedItems);

				if (updatedSelectedItems.has(name)) {
					updatedSelectedItems.delete(name);
					setCountItem(countItem - 1);
				} else {
					updatedSelectedItems.add(name);
					setCountItem(countItem + 1);
				}

				return updatedSelectedItems;
			});

			clickTimeout = null;
		}, 200);
	};

	const handleDoubleClick = (name: string) => {
		if (clickTimeout) clearTimeout(clickTimeout);
		alert(`Double clic gauche sur ${name}`);
		clickTimeout = null;
	};

	const handleRightClick = (event: React.MouseEvent, name: string) => {
		event.preventDefault();
		alert(`Clic droit sur ${name}`);
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

	if (sortedFiles) {
		sortedFiles.map((file) => {
			console.log(file)
		})
	}

	return (
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
			<DrivePageTitle selectedItemsCount={countItem} onDelete={handleDelete} />
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
						{sortedFolders.map((folder, index) => (
							<Card
								key={index}
								className={`file-list-item ${selectedItems.has(folder.name) ? "selected" : ""}`}
								onClick={() => handleLeftClick(folder.name)}
								onDoubleClick={() => handleDoubleClick(folder.name)}
								onContextMenu={(e) => handleRightClick(e, folder.name)}
							>
								<CardTitle className="flex items-center">
									<FolderIcon className="folder-icon" />
									<span className="folder-name">{folder.name}</span>
								</CardTitle>
								<CardContent>-</CardContent>
								<CardContent>-</CardContent>
								<CardFooter>{folder.permission}</CardFooter>
							</Card>
						))}

						{sortedFiles.map((file) => (
							<Card
								key={file.id}
								className={`file-list-item ${selectedItems.has(file.name) ? "selected" : ""}`}
								onClick={() => handleLeftClick(file.name)}
								onDoubleClick={() => handleDoubleClick(file.name)}
								onContextMenu={(e) => handleRightClick(e, file.name)}
							>
								<CardTitle className="flex items-center">
									<FileText className="file-icon" />
									<span className="file-name">{file.name}</span>
								</CardTitle>
								<CardContent className="file-size">{file.size} KB</CardContent>
								<CardContent>{file.createdAt}</CardContent>
								<CardFooter>{file.permission}</CardFooter>
							</Card>
						))}
					</div>
				</div>
					</div>) : (
						<p>Le service Bedrock nest pas disponible. Veuillez vous connecter.</p>
					)}
			</div>
		</div>
	);
};

export default FileList;
