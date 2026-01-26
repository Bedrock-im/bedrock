"use client";
import { Contact } from "bedrock-ts-sdk";
import { CheckIcon, CopyIcon, Plus, UserPlus, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import CreateContactDialog from "@/components/drive/CreateContactDialog";
import { TableSkeleton } from "@/components/drive/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(true);

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
			toast.success(`Contact "${name}" added successfully`);
		} catch (_error) {
			toast.error("Failed to add contact");
		}
	};

	useEffect(() => {
		if (!bedrockClient) {
			return;
		}

		setIsLoading(true);
		(async () => {
			try {
				const contacts = await bedrockClient.contacts.listContacts();

				setContacts(contacts);
				setPublicKey(bedrockClient.getPublicKey());
			} catch (error) {
				console.error("Failed to fetch contacts:", error);
			} finally {
				setIsLoading(false);
			}
		})();
	}, [bedrockClient, setContacts, setPublicKey]);

	const filteredContacts = contacts.filter(
		(contact) =>
			contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			contact.public_key.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<div className="p-2">
			<CreateContactDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} createContact={createContact} />
			<div className="flex justify-between items-center m-2 gap-4">
				<Button onClick={() => setIsDialogOpen(true)} className="gap-2">
					<Plus size={16} />
					Add Contact
				</Button>
				<Input
					type="text"
					placeholder="Search contacts..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="rounded-xl flex-1"
				/>
			</div>
			<Card className="m-2 shadow-soft rounded-xl border-0 bg-card overflow-hidden">
				<div className="m-4 mt-2">
					<div className="flex items-center gap-2 py-2">
						<span className="text-sm font-medium text-muted-foreground">Your Public Key:</span>
						<div className="flex-1 relative">
							<Input type="text" value={publicKey} className="pr-10 text-xs font-mono" disabled />
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="absolute right-0 top-0 h-full px-2 text-muted-foreground"
								onClick={copyToClipboard}
								disabled={!publicKey}
								aria-label="Copy public key to clipboard"
							>
								{isCopied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
							</Button>
						</div>
					</div>
					<Separator orientation="horizontal" />
				</div>
				{isLoading ? (
					<TableSkeleton columns={2} rows={4} headers={["Name", "Public Key"]} />
				) : filteredContacts.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 text-center">
						<div className="size-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
							<Users className="size-8 text-muted-foreground/50" />
						</div>
						{searchQuery ? (
							<p className="text-muted-foreground">No contacts match your search.</p>
						) : (
							<>
								<p className="text-muted-foreground font-medium">No contacts yet</p>
								<p className="text-sm text-muted-foreground/70 mt-1">Add contacts to share files securely</p>
								<Button className="mt-6 gap-2" onClick={() => setIsDialogOpen(true)}>
									<UserPlus size={16} />
									Add Contact
								</Button>
							</>
						)}
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Public Key</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredContacts.map((contact) => (
								<TableRow key={contact.public_key}>
									<TableCell className="font-medium">{contact.name}</TableCell>
									<TableCell className="font-mono text-xs text-muted-foreground">
										{contact.public_key.slice(0, 20)}...{contact.public_key.slice(-8)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</Card>
		</div>
	);
}
