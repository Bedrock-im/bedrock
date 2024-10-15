import { useEffect, useState } from 'react';

import FileList from '@/components/FileList';
import { Permission } from '@/types/types';

import "./drive/drive.css";
const DrivePage = () => {
	const [files, setFiles] = useState<{ name: string; size: number; id: string; createdAt: string; permission: Permission
	}[]>([]);
	const [folders, setFolders] = useState<{ name: string; permission: Permission
	}[]>([]);
	const [searchQuery, setSearchQuery] = useState<string>(''); // State for search query


	useEffect(() => {
		const fetchData = async () => {
			setFiles([{ name: 'file1.txt', size: 20, id: '1', createdAt: '2021-10-10', permission: 'owner' },
				{ name: 'file2.png', size: 300, id: '2', createdAt: '2021-10-11', permission: 'viewer'
				}]);
			setFolders([{ name: 'Folder 1', permission: 'owner' }, { name: 'Folder 2', permission: 'viewer' }]);
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
					onChange={(e) => setSearchQuery(e.target.value)} // Update search query on input change
					className="p-2 border border-gray-300 rounded-lg w-full"
				/>
			</div>
			<div className="drive-content">
				<FileList files={filteredFiles} folders={filteredFolders} />
			</div>
		</div>
	);
};

export default DrivePage;