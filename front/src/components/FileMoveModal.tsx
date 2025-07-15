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

export function FileMoveModal({ isOpen, onClose, onComplete }: UsernameRegistrationModalProps) {
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
					<DialogTitle>Move file</DialogTitle>
					<DialogDescription>Enter the new path for the file.</DialogDescription>
				</DialogHeader>
				<div>
					<Input id="filepath" placeholder={`New file path`} value={input} onChange={(e) => setInput(e.target.value)} />
				</div>
				<DialogFooter className="justify-end">
					<Button onClick={() => onComplete(input)} disabled={input.length === 0}>
						Move
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
