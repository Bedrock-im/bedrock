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
	DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface SingleTextInputModalProps {
	isOpen: boolean;
	onClose: () => void;
	onComplete: (input: string) => Promise<void>;
	title: string;
	description: string;
	placeholder: string;
	submitLabel: string;
	defaultValue?: string;
}

export function SingleTextInputModal({
																			 isOpen,
																			 onClose,
																			 onComplete,
																			 title,
																			 description,
																			 placeholder,
																			 submitLabel,
																			 defaultValue = ""
																		 }: SingleTextInputModalProps) {
	const [input, setInput] = useState(defaultValue);
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
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<div>
					<Input
						id="text-input"
						placeholder={placeholder}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						autoFocus
					/>
				</div>
				<DialogFooter className="justify-end">
					<Button onClick={handleSubmit} disabled={input.length === 0 || isLoading} className="gap-2">
						{isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
						{submitLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
