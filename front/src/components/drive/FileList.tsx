import React, { useState } from "react";

import "@/app/(drive)/drive.css";
import { DriveItem } from "@/components/drive/DriveItem";
import { DrivePageTitle } from "@/components/drive/drivePageTitle";
import useBedrockFileUploadDropzone from "@/hooks/useBedrockFileUploadDropzone";
import { FileListProps } from "@/utils/types";

type SortColumn = "name" | "size" | "createdAt" | "permission";
type SortOrder = "asc" | "desc";

const FileList: React.FC<FileListProps> = ({ files, folders }) => {
	const [sortColumn, setSortColumn] = useState<SortColumn>("name");
	const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
	const [countItem, setCountItem] = useState<number>(0);
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

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
						<DriveItem
							key={index}
							type="folder"
							isSelected={selectedItems.has(folder.name)}
							onClick={() => handleLeftClick(folder.name)}
							file={folder}
						/>
					))}
					{sortedFiles.map((file, index) => (
						<DriveItem
							key={index}
							type="file"
							isSelected={selectedItems.has(file.name)}
							onClick={() => handleLeftClick(file.name)}
							file={file}
							size={file.size}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default FileList;
