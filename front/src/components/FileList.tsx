import React, { useState } from 'react';

import "@/pages/drive/drive.css";
import { FileListProps } from "@/types/types";

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
		if (a[sortColumn] < b[sortColumn]) return -1 * isAscending;
		if (a[sortColumn] > b[sortColumn]) return 1 * isAscending;
		return 0;
	});

	return (
		<div className="file-list-container">
			<table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
				<thead className="bg-gray-100 border-b">
				<tr>
					<th
						className="py-4 px-6 text-left font-semibold text-gray-600 cursor-pointer"
						onClick={() => handleSort('name')}
					>
						Name {sortColumn === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
					</th>
					<th
						className="py-4 px-6 text-left font-semibold text-gray-600 cursor-pointer"
						onClick={() => handleSort('size')}
					>
						Size {sortColumn === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
					</th>
					<th
						className="py-4 px-6 text-left font-semibold text-gray-600 cursor-pointer"
						onClick={() => handleSort('createdAt')}
					>
						Created At {sortColumn === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
					</th>
					<th
						className="py-4 px-6 text-left font-semibold text-gray-600 cursor-pointer"
						onClick={() => handleSort('permission')}
					>
						Permission {sortColumn === 'permission' && (sortOrder === 'asc' ? '↑' : '↓')}
					</th>
				</tr>
				</thead>
				<tbody>
				{sortedFolders.map((folder, index) => (
					<tr key={index} className="file-list-item border-b hover:bg-gray-50 transition-colors">
						<td className="py-4 px-6 font-medium text-gray-800">{folder.name}</td>
						<td className="py-4 px-6 text-gray-600">-</td>
						<td className="py-4 px-6 text-gray-600">-</td>
						<td className="py-4 px-6 text-gray-600">{folder.permission}</td>
					</tr>
				))}

				{sortedFiles.map((file) => (
					<tr key={file.id} className="file-list-item border-b hover:bg-gray-50 transition-colors">
						<td className="py-4 px-6 font-medium text-gray-800">{file.name}</td>
						<td className="py-4 px-6 text-gray-600">{file.size} KB</td>
						<td className="py-4 px-6 text-gray-600">{file.createdAt}</td>
						<td className="py-4 px-6 text-gray-600">{file.permission}</td>
					</tr>
				))}
				</tbody>
			</table>
		</div>
	);
};

export default FileList;
