"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UsernameRegistrationModalProps {
	isOpen: boolean;
	onComplete: (newName: string) => void;
	name?: string;
}

export function FileRenameModal({ isOpen, onComplete, name }: UsernameRegistrationModalProps) {
	const [input, setInput] = useState("");

	return (
		<Dialog open={isOpen}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Rename file</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="username" className="text-right">
							Username
						</Label>
						<div className="col-span-3">
							<Input
								id="filename"
								placeholder={`New file name`}
								defaultValue={name ?? ""}
								value={input}
								onChange={(e) => setInput(e.target.value)}
							/>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button onClick={() => onComplete(input)} disabled={input === name || input.length === 0} className="w-full">
						Rename
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
