"use client";

import { ChevronRight, FolderIcon, Home, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DriveFolder, useDriveStore } from "@/stores/drive";
import { getParentPath, normalizePath } from "@/utils/path";

interface FolderBrowserModalProps {
	isOpen: boolean;
	onClose: () => void;
	onComplete: (destinationPath: string) => Promise<void> | void;
	mode: "move" | "copy";
	itemName: string;
	initialPath?: string;
	sourcePath?: string;
}

export function FolderBrowserModal({
	isOpen,
	onClose,
	onComplete,
	mode,
	itemName,
	initialPath = "/",
	sourcePath,
}: Readonly<FolderBrowserModalProps>) {
	const [currentPath, setCurrentPath] = useState(initialPath);
	const [isLoading, setIsLoading] = useState(false);
	const allFolders = useDriveStore((state) => state.folders);

	useEffect(() => {
		if (isOpen) {
			setCurrentPath(initialPath);
		}
	}, [isOpen, initialPath]);

	const normalizedSourcePath = sourcePath ? (sourcePath.endsWith("/") ? sourcePath : sourcePath + "/") : null;

	const foldersInCurrentPath = useMemo(() => {
		return allFolders.filter((folder) => {
			if (folder.deleted_at) return false;
			if (normalizedSourcePath && (folder.path + "/").startsWith(normalizedSourcePath)) return false;
			const folderPathParts = folder.path.split("/").filter(Boolean);
			const currentPathParts = currentPath === "/" ? [] : currentPath.split("/").filter(Boolean);
			return (
				folderPathParts.length === currentPathParts.length + 1 &&
				folder.path.startsWith(currentPath === "/" ? "/" : currentPath)
			);
		});
	}, [allFolders, currentPath, normalizedSourcePath]);

	const pathParts = currentPath === "/" ? [] : currentPath.split("/").filter(Boolean);

	const handleFolderClick = (folder: DriveFolder) => {
		const normalizedPath = folder.path.endsWith("/") ? folder.path : folder.path + "/";
		setCurrentPath(normalizedPath);
	};

	const handleBreadcrumbClick = (index: number) => {
		if (index === -1) {
			setCurrentPath("/");
		} else {
			const newPath = "/" + pathParts.slice(0, index + 1).join("/") + "/";
			setCurrentPath(newPath);
		}
	};

	const handleComplete = async () => {
		if (mode === "move" && isInvalidDestination) return;
		if (isLoading) return;
		const normalizedPath = normalizePath(currentPath);
		setIsLoading(true);
		try {
			await onComplete(normalizedPath);
			setCurrentPath(initialPath);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleComplete();
		}
	};

	const handleClose = () => {
		setCurrentPath(initialPath);
		onClose();
	};

	const isInvalidDestination = (() => {
		if (!normalizedSourcePath) return false;
		const normalizedCurrent = normalizePath(currentPath);
		const sourceParent = getParentPath(normalizedSourcePath);
		if (normalizedCurrent === sourceParent) return true;
		if (normalizedCurrent.startsWith(normalizedSourcePath)) return true;
		return false;
	})();

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(b) => {
				if (!b) handleClose();
			}}
		>
			<DialogContent className="sm:max-w-md" onKeyDown={handleKeyDown}>
				<DialogHeader>
					<DialogTitle>{mode === "move" ? "Move" : "Copy"} to...</DialogTitle>
					<DialogDescription>Select a destination folder for &quot;{itemName}&quot;</DialogDescription>
				</DialogHeader>

				<div className="flex items-center gap-1 text-sm text-muted-foreground py-2 flex-wrap">
					<Button variant="ghost" size="sm" className="h-7 px-2 gap-1" onClick={() => handleBreadcrumbClick(-1)}>
						<Home size={14} />
						Home
					</Button>
					{pathParts.map((part, index) => (
						<div key={index} className="flex items-center gap-1">
							<ChevronRight size={14} />
							<Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleBreadcrumbClick(index)}>
								{part}
							</Button>
						</div>
					))}
				</div>

				<ScrollArea className="h-[300px] border rounded-lg">
					<div className="p-2">
						{foldersInCurrentPath.length === 0 ? (
							<div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
								<FolderIcon size={48} className="opacity-20 mb-2" />
								<p className="text-sm">No subfolders</p>
							</div>
						) : (
							<div className="space-y-1">
								{foldersInCurrentPath.map((folder) => {
									const folderName = folder.path.split("/").filter(Boolean).pop();
									return (
										<button
											key={folder.path}
											onClick={() => handleFolderClick(folder)}
											className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
										>
											<div className="flex items-center justify-center size-10 rounded-xl bg-amber-100 text-amber-600">
												<FolderIcon size={20} />
											</div>
											<span className="font-medium text-sm">{folderName}</span>
											<ChevronRight size={16} className="ml-auto text-muted-foreground" />
										</button>
									);
								})}
							</div>
						)}
					</div>
				</ScrollArea>

				<DialogFooter className="flex-row gap-2 sm:justify-between">
					<Button variant="outline" onClick={handleClose} disabled={isLoading}>
						Cancel
					</Button>
					<Button
						onClick={handleComplete}
						className="gap-2"
						disabled={(mode === "move" && isInvalidDestination) || isLoading}
					>
						{isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
						{mode === "move" ? "Move here" : "Copy here"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
