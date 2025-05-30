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
	createContact: (data: ContactFormData) => void;
}

export default function CreateContactDialog({ isOpen, onOpenChange, createContact }: CreateContactDialogProps) {
	const { contacts } = useDriveStore();
	const [contactFormData, setContactFormData] = useState<ContactFormData>({
		name: "",
		address: "",
		publicKey: "",
	});

	const isContactNameTaken = useMemo(() => {
		return contacts.some((contact) => contact.name === contactFormData.name);
	}, [contacts, contactFormData.name]);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create a contact</DialogTitle>
				</DialogHeader>
				<Input
					value={contactFormData.name}
					onChange={(e) =>
						setContactFormData({
							...contactFormData,
							name: e.target.value,
						})
					}
					placeholder="Contact Name"
					className={`${isContactNameTaken && "border-destructive"}`}
				/>
				{isContactNameTaken && (
					<DialogDescription className="text-destructive">Contact name is already taken.</DialogDescription>
				)}
				<Input
					value={contactFormData.address}
					onChange={(e) =>
						setContactFormData({
							...contactFormData,
							address: e.target.value,
						})
					}
					placeholder="Contact Address"
					className="w-full"
				/>
				<Input
					value={contactFormData.publicKey}
					onChange={(e) =>
						setContactFormData({
							...contactFormData,
							publicKey: e.target.value,
						})
					}
					placeholder="Contact Public Key"
					className="w-full"
				/>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button
						disabled={
							!contactFormData.name.length ||
							!contactFormData.address.length ||
							!contactFormData.publicKey.length ||
							isContactNameTaken
						}
						onClick={() => createContact(contactFormData)}
					>
						Create
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
