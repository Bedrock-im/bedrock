"use client";
import { CheckIcon, CopyIcon, Plus } from "lucide-react";
import { useQueryState } from "nuqs";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import CreateContactDialog from "@/components/drive/CreateContactDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Contact } from "@/services/bedrock";
import { useAccountStore } from "@/stores/account";

export interface ContactFormData {
	name: string;
	address: string;
	publicKey: string;
}

export default function Contacts() {
	const { bedrockService } = useAccountStore();

	const [publicKey, setPublicKey] = useState<string>("");
	const [contacts, setContacts] = useState<Contact[]>([]);
	const [_searchQuery, _setSearchQuery] = useQueryState("search", { defaultValue: "" });
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const [isCopied, setIsCopied] = useState(false);

	const copyToClipboard = async () => {
		if (publicKey) {
			try {
				await navigator.clipboard.writeText(publicKey);
				setIsCopied(true);
				toast.success("Public key copied to clipboard");
				setTimeout(() => setIsCopied(false), 2000);
			} catch (_err) {
				toast.error("Copy failed");
			}
		}
	};

	const createContact = async ({ name, address, publicKey }: ContactFormData) => {
		try {
			await bedrockService?.createContact(name, address, publicKey);
			setContacts([
				...contacts,
				{
					name,
					address: address,
					public_key: publicKey,
				},
			]);
			setIsDialogOpen(false);
		} catch (_error) {}
	};

	useEffect(() => {
		if (!bedrockService) {
			return;
		}

		(async () => {
			try {
				const contacts = await bedrockService.fetchContacts();

				setContacts(contacts);
				setPublicKey(bedrockService.alephPublicKey);
			} catch (error) {
				console.error("Failed to fetch contacts:", error);
			}
		})();
	}, [bedrockService, setContacts, setPublicKey]);

	return (
		<>
			<CreateContactDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} createContact={createContact} />
			<div className="flex items-center m-2 gap-4">
				<button
					className="ml-2 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-100 scale-90 focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center"
					aria-label="Add"
					onClick={() => setIsDialogOpen(true)}
				>
					<Plus size={20} className="transition-transform duration-300 transform group-hover:rotate-90" />
				</button>
				<div className="w-full">
					<label htmlFor="sensitive-input" className="block text-sm font-medium mb-2">
						Your Public key
					</label>
					<div className="relative">
						<Input type="text" id="public-key" value={publicKey} className="pr-10" disabled />
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="absolute right-0 top-0 h-full px-2"
							onClick={copyToClipboard}
							disabled={!publicKey}
							aria-label="Copy sensitive data to clipboard"
						>
							{isCopied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
						</Button>
					</div>
				</div>
			</div>
			<Card className="m-2 pb-2 gap-y-4">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[40px]">Name</TableHead>
							<TableHead className="w-[40px]">Public key</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{contacts.map((contact) => (
							<TableRow key={contact.public_key}>
								<TableCell>{contact.name}</TableCell>
								<TableCell>{contact.public_key}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Card>
		</>
	);
}
