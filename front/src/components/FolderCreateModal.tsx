"use client";

import { SingleTextInputModal } from "@/components/SingleTextInputModal";

interface FolderCreateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onComplete: (folderName: string) => Promise<void> | void;
	validate?: (folderName: string) => string | null;
}

export function FolderCreateModal({ isOpen, onClose, onComplete, validate }: Readonly<FolderCreateModalProps>) {
	return (
		<SingleTextInputModal
			isOpen={isOpen}
			onClose={onClose}
			onComplete={onComplete}
			title="Create folder"
			description="Enter the name for the new folder."
			placeholder="Folder name"
			submitLabel="Create"
			validate={validate}
		/>
	);
}
