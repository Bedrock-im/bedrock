"use client";

import { useEffect, useState } from "react";

import FileList from "@/components/drive/fileList";
import { Separator } from "@/components/ui/separator";
import { Permission } from "@/utils/types";

import "./drive.css";
const SetupFileList = () => {
	const [files, setFiles] = useState<
		{ name: string; size: number; id: string; createdAt: string; permission: Permission; path: string }[]
	>([]);
	const [folders, setFolders] = useState<{ name: string; permission: Permission; path: string }[]>([]);
	const [searchQuery, setSearchQuery] = useState<string>("");

	useEffect(() => {
		const fetchData = async () => {
			setFiles([
				{ name: "file1.txt", size: 20, id: "1", createdAt: "2021-10-10", permission: "owner", path: "/Folder 1" },
				{ name: "file2.png", size: 300, id: "2", createdAt: "2021-10-11", permission: "viewer", path: "/" },
				{ name: "file3.png", size: 300, id: "2", createdAt: "2021-10-11", permission: "viewer", path: "/" },
				{ name: "file4.png", size: 300, id: "2", createdAt: "2021-10-11", permission: "viewer", path: "/" },
				{ name: "file5.png", size: 300, id: "2", createdAt: "2021-10-11", permission: "viewer", path: "/" },
				{ name: "file6.png", size: 300, id: "2", createdAt: "2021-10-11", permission: "viewer", path: "/" },
				{ name: "file7.png", size: 300, id: "2", createdAt: "2021-10-11", permission: "viewer", path: "/" },
				{ name: "file8.png", size: 300, id: "2", createdAt: "2021-10-11", permission: "viewer", path: "/" },
				{ name: "file9.png", size: 300, id: "2", createdAt: "2021-10-11", permission: "viewer", path: "/" },
				{ name: "file10.png", size: 300, id: "2", createdAt: "2021-10-11", permission: "viewer", path: "/" },
				{ name: "file11.png", size: 300, id: "2", createdAt: "2021-10-11", permission: "viewer", path: "/" },
				{ name: "file12.png", size: 300, id: "2", createdAt: "2021-10-11", permission: "viewer", path: "/" },
				{ name: "file13.png", size: 300, id: "2", createdAt: "2021-10-11", permission: "viewer", path: "/" },
				{ name: "file14.png", size: 300, id: "2", createdAt: "2021-10-11", permission: "viewer", path: "/" },
				{ name: "file15.png", size: 300, id: "2", createdAt: "2021-10-11", permission: "viewer", path: "/" },
				{ name: "file16.png", size: 300, id: "2", createdAt: "2021-10-11", permission: "viewer", path: "/" },
				{ name: "file17.png", size: 300, id: "2", createdAt: "2021-10-11", permission: "viewer", path: "/" },
				{ name: "file18.png", size: 300, id: "2", createdAt: "2021-10-11", permission: "viewer", path: "/" },
				{ name: "file19.png", size: 300, id: "2", createdAt: "2021-10-11", permission: "viewer", path: "/" },
				{ name: "file20.png", size: 300, id: "2", createdAt: "2021-10-11", permission: "viewer", path: "/" },
			]);
			setFolders([
				{ name: "Folder 1", permission: "owner", path: "/" },
				{ name: "Folder 2", permission: "viewer", path: "/" },
			]);
		};

		fetchData().then((r) => r);
	}, []);

	const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()));
	const filteredFolders = folders.filter((folder) => folder.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
				<FileList files={filteredFiles} folders={filteredFolders} />
			</div>
			<Separator />
		</div>
	);
};

export default SetupFileList;
