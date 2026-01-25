"use client";

import { Contact } from "bedrock-ts-sdk";
import { useMemo, useState } from "react";

import { PublicFileShareModal } from "@/components/PublicFileShareModal";
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
	onComplete: (contact?: Contact) => void;
	contacts: Contact[];
}

export function FileShareModal({ isOpen, onClose, onComplete, contacts }: Readonly<UsernameRegistrationModalProps>) {
	const [input, setInput] = useState("");
	const [isPublicModalOpen, setIsPublicModalOpen] = useState(false);

	const contact = contacts.find((contact) => contact.name === input);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(b) => {
				if (!b) onClose();
			}}
		>
			<PublicFileShareModal
				isOpen={isPublicModalOpen}
				onClose={() => setIsPublicModalOpen(false)}
				onComplete={() => onComplete()}
			/>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Share file</DialogTitle>
					<DialogDescription>
						Enter the contact you want to share this file with. Or, you can also share the current version of this file
						publicly. Please note that this action is irreversible.
					</DialogDescription>
				</DialogHeader>
				<div>
					<Input id="contact" placeholder={`Contact name`} value={input} onChange={(e) => setInput(e.target.value)} />
					{input.length > 0 && !contact && <p className={`text-sm mt-1 text-red-500`}>Contact not found</p>}
				</div>
				<DialogFooter className="justify-end">
					<Button onClick={() => setIsPublicModalOpen(true)}>Share publicly</Button>
					<Button onClick={() => contact && onComplete(contact)} disabled={input.length === 0 || !contact}>
						Share
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
