import { FolderIcon, FileText } from "lucide-react";
import React, { useState } from 'react';

import "@/app/(drive)/drive.css";
import { Card, CardFooter, CardTitle, CardContent } from "@/components/ui/card";
import { FileListProps } from "@/utils/types";

type SortColumn = 'name' | 'size' | 'createdAt' | 'permission';
type SortOrder = 'asc' | 'desc';

const FileList: React.FC<FileListProps> = ({ files, folders }) => {
	const [sortColumn, setSortColumn] = useState<SortColumn>('name');
	const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

	let clickTimeout: NodeJS.Timeout | null = null;

	const handleSort = (column: SortColumn) => {
		if (sortColumn === column) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortColumn(column);
			setSortOrder('asc');
		}
	};

	const handleLeftClick = (name: string) => {
		if (clickTimeout) clearTimeout(clickTimeout);

		clickTimeout = setTimeout(() => {
			alert(`Clic gauche sur ${name}`);
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
		const isAscending = sortOrder === 'asc' ? 1 : -1;
		if (a[sortColumn] < b[sortColumn]) return -1 * isAscending;
		if (a[sortColumn] > b[sortColumn]) return 1 * isAscending;
		return 0;
	});

	const sortedFolders = [...folders].sort((a, b) => {
		return 0;
	});

	return (
		<div className="file-list-container">
			<div className="file-list-header">
				<div onClick={() => handleSort('name')} className="cursor-pointer">
					Name {sortColumn === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
				</div>
				<div onClick={() => handleSort('size')} className="cursor-pointer">
					Size {sortColumn === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
				</div>
				<div onClick={() => handleSort('createdAt')} className="cursor-pointer">
					Created At {sortColumn === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
				</div>
				<div onClick={() => handleSort('permission')} className="cursor-pointer">
					Permission {sortColumn === 'permission' && (sortOrder === 'asc' ? '↑' : '↓')}
				</div>
			</div>

			<div className="file-list-content">
				{sortedFolders.map((folder, index) => (
					<Card
						key={index}
						className="file-list-item"
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
						className="file-list-item"
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
	);
};

export default FileList;
