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
	onComplete: (newName: string) => void;
}

export function FileRenameModal({ isOpen, onClose, onComplete }: UsernameRegistrationModalProps) {
	const [input, setInput] = useState("");

	const handleSubmit = () => {
		if (input.length > 0) {
			onComplete(input);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(b) => {
				if (!b) onClose();
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Rename file</DialogTitle>
					<DialogDescription>Enter the new name for the file.</DialogDescription>
				</DialogHeader>
				<div>
					<Input
						id="filename"
						placeholder="New file name"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						autoFocus
					/>
				</div>
				<DialogFooter className="justify-end">
					<Button onClick={handleSubmit} disabled={input.length === 0}>
						Rename
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
