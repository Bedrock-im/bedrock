import React, { useState } from 'react';

import "@/app/(drive)/drive.css";
import { FileListProps } from "@/utils/types";
import { Card, CardFooter, CardTitle, CardContent } from "@/components/ui/card";
import { FolderIcon, FileText } from "lucide-react";

type SortColumn = 'name' | 'size' | 'createdAt' | 'permission';
type SortOrder = 'asc' | 'desc';

const FileList: React.FC<FileListProps> = ({ files, folders }) => {
	const [sortColumn, setSortColumn] = useState<SortColumn>('name');
	const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

	const handleSort = (column: SortColumn) => {
		if (sortColumn === column) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortColumn(column);
			setSortOrder('asc');
		}
	};

	const sortedFiles = [...files].sort((a, b) => {
		const isAscending = sortOrder === 'asc' ? 1 : -1;
		if (a[sortColumn] < b[sortColumn]) return -1 * isAscending;
		if (a[sortColumn] > b[sortColumn]) return 1 * isAscending;
		return 0;
	});

	const sortedFolders = [...folders].sort((a, b) => {
		const isAscending = sortOrder === 'asc' ? 1 : -1;
		//if (a[sortColumn] < b[sortColumn]) return -1 * isAscending;
		//if (a[sortColumn] > b[sortColumn]) return 1 * isAscending;
		return 0;
	});
	console.log(sortedFiles);



	return (
		<div className="file-list-container">
			<div className="file-list-header grid grid-cols-4 gap-4 mb-4 font-semibold text-gray-600">
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

			<div className="file-list-content max-h-[70vh] overflow-y-auto">
				{sortedFolders.map((folder, index) => (
					<Card key={index}
								className="grid grid-cols-4 gap-3 p-2.5 mb-1.5 hover:bg-gray-100 hover:shadow-lg transition">
						<CardTitle className="flex items-center">
							<FolderIcon className="size-6 mr-2 text-gray-500 fill-current" />
							{folder.name}</CardTitle>
						<CardContent>-</CardContent>
						<CardContent>-</CardContent>
						<CardFooter>{folder.permission}</CardFooter>
					</Card>
				))}

				{sortedFiles.map((file) => (
					<Card key={file.id}
								className="grid grid-cols-4 gap-3 p-2 mb-1.5 hover:bg-gray-100 hover:shadow-lg transition">
						<CardTitle className="flex items-center">
							<FileText className="size-6 mr-2 text-gray-500" />
							{file.name}</CardTitle>						<CardContent>{file.size} KB</CardContent>
						<CardContent>{file.createdAt}</CardContent>
						<CardFooter>{file.permission}</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
};

export default FileList;