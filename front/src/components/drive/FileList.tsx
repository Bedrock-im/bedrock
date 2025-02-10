import React, { useState } from "react";

import "@/app/(drive)/drive.css";
import { DrivePageTitle } from "@/components/drive/DrivePageTitle";
import FileCard from "@/components/drive/FileCard";
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

	const handleSort = (column: SortColumn) => {
		if (sortColumn === column) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortColumn(column);
			setSortOrder("asc");
		}
	};

	const handleLeftClick = (path: string, folder: boolean) => {
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

	const handleDoubleClick = (path: string, folder: boolean) => {
		if (clickTimeout) clearTimeout(clickTimeout);
		alert(`Double clic gauche sur ${path}`);
		clickTimeout = null;
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
							onDoubleClick={() => handleDoubleClick(folder.path, true)}
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
							onLeftClick={() => handleLeftClick(file.path, false)}
							onDoubleClick={() => handleDoubleClick(file.path, false)}
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
