"use client";
import { Contact } from "bedrock-ts-sdk";
import { CheckIcon, CopyIcon, Plus } from "lucide-react";
import { useQueryState } from "nuqs";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import CreateContactDialog from "@/components/drive/CreateContactDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAccountStore } from "@/stores/account";

export const dynamic = "force-dynamic";

export interface ContactFormData {
	name: string;
	address: string;
	publicKey: string;
}

export default function Contacts() {
	const { bedrockClient } = useAccountStore();

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
			await bedrockClient?.contacts.addContact(name, address, publicKey);
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
		if (!bedrockClient) {
			return;
		}

		(async () => {
			try {
				const contacts = await bedrockClient.contacts.listContacts();

				setContacts(contacts);
				setPublicKey(bedrockClient.getPublicKey());
			} catch (error) {
				console.error("Failed to fetch contacts:", error);
			}
		})();
	}, [bedrockClient, setContacts, setPublicKey]);

	return (
		<>
			<CreateContactDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} createContact={createContact} />
			<div className="flex items-center m-2 gap-4">
				<button
					className="ml-2 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-all transform hover:scale-100 scale-90 focus:outline-none focus:ring-4 focus:ring-purple-300 flex items-center justify-center"
					aria-label="Add"
					onClick={() => setIsDialogOpen(true)}
				>
					<Plus size={20} className="transition-transform duration-300 transform group-hover:rotate-90" />
				</button>
				<div className="w-full">
					<label htmlFor="sensitive-input" className="block text-sm font-medium mb-2">
						Your Public Key
					</label>
					<div className="relative">
						<Input type="text" id="public-key" value={publicKey} className="pr-10" disabled />
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="absolute right-0 top-0 h-full px-2 text-muted-foreground"
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
