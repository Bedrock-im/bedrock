"use client";

import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";

import FileList from "@/components/drive/fileList";
import { Separator } from "@/components/ui/separator";
import { useAccountStore } from "@/stores/account";
import { Permission } from "@/utils/types";

import "./drive.css";

const SetupFileList = () => {
	const [files, setFiles] = useState<
		{ name: string; size: number; id: string; createdAt: string; permission: Permission; path: string }[]
	>([]);
	const [folders, setFolders] = useState<{ name: string; permission: Permission; path: string }[]>([]);
	const [searchQuery, setSearchQuery] = useState<string>("");

	const bedrockService = useAccountStore((state) => state.bedrockService);

	useEffect(() => {
		const fetchData = async () => {
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
				console.error("Failed to fetch files:", error);
			}
		};

		fetchData().then((r) => r);
	}, [bedrockService]);

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
				{bedrockService ? (
					<FileList files={filteredFiles} folders={filteredFolders} />
				) : (
					<LoaderIcon className="animate-spin m-auto h-[100vh]" />
				)}
			</div>
			<Separator />
		</div>
	);
};

export default SetupFileList;
