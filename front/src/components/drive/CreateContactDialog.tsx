import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { ContactFormData } from "@/app/(drive)/contacts/page";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDriveStore } from "@/stores/drive";

interface CreateContactDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	createContact: (data: ContactFormData) => Promise<void> | void;
}

export default function CreateContactDialog({ isOpen, onOpenChange, createContact }: CreateContactDialogProps) {
	const { contacts } = useDriveStore();
	const [username, setUsername] = useState("");
	const [address, setAddress] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const isContactNameTaken = useMemo(() => {
		return contacts.some((contact) => contact.name === username);
	}, [contacts, username]);

	const isValidAddress = address.match(/^0x[a-fA-F0-9]{40}$/);

	const canSubmit = username.length > 0 && isValidAddress && !isContactNameTaken && !isSubmitting;

	const handleSubmit = async () => {
		if (!canSubmit) return;
		setIsSubmitting(true);
		try {
			await createContact({ username, address });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && canSubmit) {
			e.preventDefault();
			handleSubmit();
		}
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setUsername("");
			setAddress("");
		}
		onOpenChange(open);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create a contact</DialogTitle>
				</DialogHeader>
				{isContactNameTaken && (
					<DialogDescription className="text-destructive">Contact name is already taken.</DialogDescription>
				)}
				<Input
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="Username"
					className="w-full"
					onKeyDown={handleKeyDown}
					// eslint-disable-next-line jsx-a11y/no-autofocus -- Improves UX in modal dialogs by focusing first input
					autoFocus
				/>
				<Input
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					placeholder="Contact Address (0x...)"
					className={`w-full ${address && !isValidAddress ? "border-destructive" : ""}`}
					onKeyDown={handleKeyDown}
				/>
				{address && !isValidAddress && (
					<DialogDescription className="text-destructive">Invalid address format</DialogDescription>
				)}
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={isSubmitting}>
							Cancel
						</Button>
					</DialogClose>
					<Button disabled={!canSubmit} onClick={handleSubmit} className="gap-2">
						{isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
						Create
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
