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

export type RenameDialogProps = {
	name: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onRename: (newName: string) => void;
	title?: string;
	description?: string;
};

export default function RenameDialog({
	name,
	open,
	onOpenChange,
	onRename,
	title = "Rename",
	description = "Enter a new name",
}: RenameDialogProps) {
	const [newName, setNewName] = useState(name);
	const [error, setError] = useState<string>();

	const handleSave = () => {
		const trimmedName = newName.trim();
		if (trimmedName !== "") {
			try {
				onRename(trimmedName);
				setError(undefined);
				onOpenChange(false);
			} catch (error) {
				setError(error instanceof Error ? error.message : "Failed to rename knowledge item");
			}
		}
	};

	const handleCancel = () => {
		setNewName(name);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<div className="space-y-2 py-2">
					<Input
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						placeholder="Enter new name"
						onKeyDown={(e) => e.key === "Enter" && handleSave()}
						autoFocus
						className={error ? "border-red-500" : ""}
					/>
					{error && <p className="text-sm font-medium text-red-500">{error}</p>}
				</div>
				<DialogFooter className="flex justify-end gap-2">
					<Button variant="outline" onClick={handleCancel}>
						Cancel
					</Button>
					<Button onClick={handleSave}>Save</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
