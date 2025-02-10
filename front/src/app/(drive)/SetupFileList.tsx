"use client";

import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";

import FileList from "@/components/drive/FileList";
import { Separator } from "@/components/ui/separator";
import { useAccountStore } from "@/stores/account";
import { useDriveStore } from "@/stores/drive";

import "./drive.css";

const SetupFileList = () => {
	const [searchQuery, setSearchQuery] = useState<string>("");
	const { files, folders, setFiles, setFolders, currentWorkingDirectory } = useDriveStore();

	const bedrockService = useAccountStore((state) => state.bedrockService);

	useEffect(() => {
		if (!bedrockService) {
			return;
		}

		(async () => {
			try {
				const fileEntries = await bedrockService.fetchFileEntries();
				const fullFiles = await bedrockService.fetchFilesMetaFromEntries(...fileEntries);

				const folderPaths = new Set<string>();

				fileEntries.forEach((file) => {
					const pathParts = file.path.split("/").filter(Boolean);
					if (pathParts.length > 1) {
						pathParts.pop();
						let currentPath = "";
						pathParts.forEach((part) => {
							currentPath += `/${part}`;
							folderPaths.add(currentPath);
						});
					}
				});

				setFiles(fullFiles);
				setFolders([
					...Array.from(folderPaths)
						.filter((path) => path !== "/")
						.map((path) => ({
							path,
							created_at: new Date().toISOString(),
							deleted_at: null,
						})),
				]);
			} catch (error) {
				console.error("Failed to fetch files:", error);
			}
		})();
	}, [bedrockService, setFolders, setFiles]);

	const cwdRegex = `^${currentWorkingDirectory.replace("/", "\\/")}[^ \\/]+$`;
	const filteredFiles = files.filter(
		(file) => file.path.match(cwdRegex) && file.path.toLowerCase().includes(searchQuery.toLowerCase()),
	);
	const filteredFolders = folders.filter(
		(folder) =>
			folder.path.match(cwdRegex) &&
			folder.path !== currentWorkingDirectory && // Don't show the current directory
			folder.path.toLowerCase().includes(searchQuery.toLowerCase()),
	);

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
