import { useEffect, useMemo, useState } from "react";

import { getAddressUsernameUsernameAddressGet } from "@/apis/usernames";
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
	const [username, setUsername] = useState("");
	const [isLoadingAddress, setIsLoadingAddress] = useState(false);

	const isContactNameTaken = useMemo(() => {
		return contacts.some((contact) => contact.name === username);
	}, [contacts, username]);

	const isValidAddress = (address: string) => {
		if (!address || address.trim() === "") return false;
		return address !== "0x0000000000000000000000000000000000000000";
	};

	useEffect(() => {
		if (username.trim()) {
			setIsLoadingAddress(true);

			const currentUsername = username;

			getAddressUsernameUsernameAddressGet({
				path: { username },
			})
				.then((response) => {
					// Only update if this is still the current username
					if (currentUsername === username) {
						const address = response.data?.address ?? "";
						if (!isValidAddress(address)) {
							setContactFormData((prev) => ({
								...prev,
								name: username,
								address: "",
							}));
						} else {
							setContactFormData((prev) => ({
								...prev,
								name: username,
								address: address,
							}));
						}
						setIsLoadingAddress(false);
					}
				})
				.catch(() => {
					// Only update if this is still the current username
					if (currentUsername === username) {
						setContactFormData((prev) => ({
							...prev,
							name: username,
							address: "",
						}));
						setIsLoadingAddress(false);
					}
				});
		} else {
			setContactFormData((prev) => ({
				...prev,
				name: "",
				address: "",
			}));
		}
	}, [username]);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
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
				/>
				<Input
					value={contactFormData.address}
					placeholder={isLoadingAddress ? "Loading address..." : "Address (auto-filled)"}
					className={`w-full ${contactFormData.address && !isValidAddress(contactFormData.address) ? "border-destructive" : ""}`}
					readOnly
					disabled={isLoadingAddress}
				/>
				{contactFormData.address && !isValidAddress(contactFormData.address) && (
					<DialogDescription className="text-destructive">Address is not valid</DialogDescription>
				)}
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
							!username.length ||
							!contactFormData.address.length ||
							!contactFormData.publicKey.length ||
							isContactNameTaken ||
							isLoadingAddress ||
							!isValidAddress(contactFormData.address)
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
