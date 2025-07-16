"use client";

import { useMemo, useState } from "react";

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
import { Contact } from "@/services/bedrock";

interface UsernameRegistrationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onComplete: (contact: Contact) => void;
	contacts: Contact[];
}

export function FileShareModal({ isOpen, onClose, onComplete, contacts }: UsernameRegistrationModalProps) {
	const [input, setInput] = useState("");

	const contact = contacts.find((contact) => contact.name === input);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(b) => {
				if (!b) onClose();
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Share file</DialogTitle>
					<DialogDescription>Enter the contact you want to share this file with.</DialogDescription>
				</DialogHeader>
				<div>
					<Input id="contact" placeholder={`Contact name`} value={input} onChange={(e) => setInput(e.target.value)} />
					{input.length > 0 && !contact && <p className={`text-sm mt-1 text-red-500`}>Contact not found</p>}
				</div>
				<DialogFooter className="justify-end">
					<Button onClick={() => contact && onComplete(contact)} disabled={input.length === 0 || !contact}>
						Share
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
