import { Loader2 } from "lucide-react";
import { useState } from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type DeleteDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDelete: () => Promise<void> | void;
	title?: string;
	description?: string;
	cancelText?: string;
	confirmText?: string;
};

export default function DeleteDialog({
	open,
	onOpenChange,
	onDelete,
	title = "Confirm deletion",
	description = "This action cannot be undone. This will permanently delete this item.",
	cancelText = "Cancel",
	confirmText = "Delete",
}: DeleteDialogProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleDelete = async () => {
		if (isLoading) return;
		setIsLoading(true);
		try {
			await onDelete();
			onOpenChange(false);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent onKeyDown={(e) => e.key === "Enter" && handleDelete()}>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					{/* eslint-disable-next-line jsx-a11y/no-autofocus -- Focuses cancel button to prevent accidental deletion */}
					<AlertDialogCancel onClick={() => onOpenChange(false)} autoFocus disabled={isLoading}>
						{cancelText}
					</AlertDialogCancel>
					<AlertDialogAction className="bg-red-500 hover:bg-red-600 gap-2" onClick={handleDelete} disabled={isLoading}>
						{isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
						{confirmText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
