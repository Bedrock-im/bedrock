"use client";

import { useQueryState } from "nuqs";

import FileList from "@/components/drive/FileList";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useDriveStore } from "@/stores/drive";

export default function Trash() {
	const [searchQuery] = useQueryState("search", { defaultValue: "" });
	const { files, folders } = useDriveStore();
	const [currentWorkingDirectory] = useQueryState("cwd", { defaultValue: "/" });

	const cwdRegex = `^${currentWorkingDirectory.replace("/", "\\/")}[^ \\/]+$`;

	const filteredFiles = files.filter(
		(file) =>
			file.path.match(cwdRegex) &&
			file.path.toLowerCase().includes(searchQuery.toLowerCase()) &&
			file.deleted_at !== null,
	);
	const filteredFolders = folders.filter(
		(folder) =>
			folder.path.match(cwdRegex) &&
			folder.path !== currentWorkingDirectory && // Don't show the current directory
			folder.path.toLowerCase().includes(searchQuery.toLowerCase()) &&
			folder.deleted_at !== null,
	);
	return (
		<section>
			<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
				<div className="flex items-center gap-2 px-4">
					<SidebarTrigger className="-ml-1" />
				</div>
			</header>
			<FileList
				files={filteredFiles}
				folders={filteredFolders}
				actions={new Set(["download", "hardDelete", "restore"] as const)}
			/>
		</section>
	);
}
