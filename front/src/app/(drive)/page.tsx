"use client";

import { useQueryState } from "nuqs";

import FileList from "@/components/drive/FileList";
import { useDriveStore } from "@/stores/drive";

export default function Home() {
	const [searchQuery] = useQueryState("search", { defaultValue: "" });
	const { files, folders } = useDriveStore();
	const [currentWorkingDirectory] = useQueryState("cwd", { defaultValue: "/" });

	const cwdRegex = `^${currentWorkingDirectory.replace("/", "\\/")}[^ \\/]+$`;

	const filteredFiles = files.filter(
		(file) =>
			file.path.match(cwdRegex) &&
			file.path.toLowerCase().includes(searchQuery.toLowerCase()) &&
			file.deleted_at === null,
	);

	const filteredFolders = folders.filter(
		(folder) =>
			folder.path.match(cwdRegex) &&
			folder.path !== currentWorkingDirectory && // Don't show the current directory
			folder.path.toLowerCase().includes(searchQuery.toLowerCase()) &&
			folder.deleted_at === null,
	);

	return (
		<FileList
			files={filteredFiles}
			folders={filteredFolders}
			actions={new Set(["download", "share", "rename", "move", "delete"] as const)}
		/>
	);
}
