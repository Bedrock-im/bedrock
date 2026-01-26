"use client";

import { SingleTextInputModal } from "@/components/SingleTextInputModal";

interface FolderCreateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onComplete: (folderName: string) => Promise<void> | void;
}

export function FolderCreateModal({ isOpen, onClose, onComplete }: FolderCreateModalProps) {
	return (
		<SingleTextInputModal
			isOpen={isOpen}
			onClose={onClose}
			onComplete={onComplete}
			title="Create folder"
			description="Enter the name for the new folder."
			placeholder="Folder name"
			submitLabel="Create"
		/>
	);
}
