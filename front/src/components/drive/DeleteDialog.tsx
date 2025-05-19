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
	onDelete: () => void;
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
	const handleDelete = () => {
		onDelete();
		onOpenChange(false);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent onKeyDown={(e) => e.key === "Enter" && handleDelete()}>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => onOpenChange(false)} autoFocus>
						{cancelText}
					</AlertDialogCancel>
					<AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={handleDelete}>
						{confirmText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
