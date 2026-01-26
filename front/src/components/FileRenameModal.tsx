"use client";

import { SingleTextInputModal } from "@/components/SingleTextInputModal";

interface FileRenameModalProps {
	isOpen: boolean;
	onClose: () => void;
	onComplete: (newName: string) => Promise<void> | void;
}

export function FileRenameModal({ isOpen, onClose, onComplete }: Readonly<FileRenameModalProps>) {
	return (
		<SingleTextInputModal
			isOpen={isOpen}
			onClose={onClose}
			onComplete={onComplete}
			title="Rename file"
			description="Enter the new name for the file."
			placeholder="New file name"
			submitLabel="Rename"
		/>
	);
}
