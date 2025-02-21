"use client";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContactSchema } from "@/services/bedrock";
import { useAccountStore } from "@/stores/account";

export default function Contacts() {
	const { bedrockService } = useAccountStore();

	const [publicKey, setPublicKey] = useState<string>("");
	const [contacts, setContacts] = useState<ContactSchema[]>([]);

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
			<div className="max-w-md mx-auto p-4">
				<label htmlFor="sensitive-input" className="block text-sm font-medium mb-2">
					Public key
				</label>
				<div className="relative">
					<Input type="text" id="public-key" value={publicKey} className="pr-10" disabled />
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="absolute right-0 top-0 h-full px-3"
						onClick={copyToClipboard}
						disabled={!publicKey}
						aria-label="Copy sensitive data to clipboard"
					>
						{isCopied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
					</Button>
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
