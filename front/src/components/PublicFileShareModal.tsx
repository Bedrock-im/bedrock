"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface UsernameRegistrationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onComplete: () => void;
}

export function PublicFileShareModal({ isOpen, onClose, onComplete }: UsernameRegistrationModalProps) {
	return (
		<Dialog
			open={isOpen}
			onOpenChange={(b) => {
				if (!b) onClose();
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Are you sure?</DialogTitle>
					<DialogDescription>This action is irreversible.</DialogDescription>
				</DialogHeader>
				<DialogFooter className="justify-end">
					<Button variant="outline" onClick={onClose}>
						Back
					</Button>
					<Button onClick={onComplete}>Share</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
