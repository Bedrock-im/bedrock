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

interface SingleTextInputModalProps {
	isOpen: boolean;
	onClose: () => void;
	onComplete: (input: string) => void;
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
	defaultValue = "",
}: SingleTextInputModalProps) {
	const [input, setInput] = useState(defaultValue);

	const handleSubmit = () => {
		if (input.length > 0) {
			onComplete(input);
			setInput("");
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
		}
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			onClose();
			setInput("");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
					<Button onClick={handleSubmit} disabled={input.length === 0}>
						{submitLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
