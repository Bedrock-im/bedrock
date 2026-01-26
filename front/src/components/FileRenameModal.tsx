"use client";

import { Loader2 } from "lucide-react";
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
	onComplete: (newName: string) => Promise<void> | void;
}

export function FileRenameModal({ isOpen, onClose, onComplete }: UsernameRegistrationModalProps) {
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async () => {
		if (input.length > 0 && !isLoading) {
			setIsLoading(true);
			try {
				await onComplete(input);
			} finally {
				setIsLoading(false);
			}
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
					<Button onClick={handleSubmit} disabled={input.length === 0 || isLoading} className="gap-2">
						{isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
						Rename
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
