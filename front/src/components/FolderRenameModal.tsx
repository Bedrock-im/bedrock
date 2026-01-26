"use client";

import { SingleTextInputModal } from "@/components/SingleTextInputModal";

interface FolderRenameModalProps {
	isOpen: boolean;
	onClose: () => void;
	onComplete: (newName: string) => void;
}

export function FolderRenameModal({ isOpen, onClose, onComplete }: FolderRenameModalProps) {
	return (
		<SingleTextInputModal
			isOpen={isOpen}
			onClose={onClose}
			onComplete={onComplete}
			title="Rename folder"
			description="Enter the new name for the folder."
			placeholder="New folder name"
			submitLabel="Rename"
		/>
	);
}
