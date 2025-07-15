"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface UsernameRegistrationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onComplete: (folderName: string) => void;
}

export function FolderCreateModal({ isOpen, onClose, onComplete }: UsernameRegistrationModalProps) {
	const [input, setInput] = useState("");

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(b) => {
				if (!b) onClose();
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create folder</DialogTitle>
					<DialogDescription>Enter the name for the new folder.</DialogDescription>
				</DialogHeader>
				<div>
					<Input
						id="folder-name"
						placeholder={`Folder name`}
						value={input}
						onChange={(e) => setInput(e.target.value)}
					/>
				</div>
				<DialogFooter className="justify-end">
					<Button onClick={() => onComplete(input)} disabled={input.length === 0}>
						Create
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
