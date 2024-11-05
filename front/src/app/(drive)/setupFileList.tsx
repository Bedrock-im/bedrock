"use client";

import { useEffect, useState } from 'react';

import FileList from '@/components/drive/fileList';
import { Permission } from '@/utils/types';

import "./drive.css";
const SetupFileList = () => {
	const [files, setFiles] = useState<{ name: string; size: number; id: string; createdAt: string; permission: Permission, path: string
	}[]>([]);
	const [folders, setFolders] = useState<{ name: string; permission: Permission, path: string
	}[]>([]);
	const [userPath, setUserPath] = useState<string>('/');
	const [searchQuery, setSearchQuery] = useState<string>('');


	useEffect(() => {
		const fetchData = async () => {
		};

		fetchData();
	}, []);

	const filteredFiles = files.filter((file) =>
		file.name.toLowerCase().includes(searchQuery.toLowerCase())
	);
	const filteredFolders = folders.filter((folder) =>
		folder.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="drive-container">
			<div className="drive-title">
				<h1>My Decentralized Drive</h1>
			</div>
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
				<FileList files={filteredFiles} folders={filteredFolders} />
			</div>
		</div>
	);
};

export default SetupFileList;