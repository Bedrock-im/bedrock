"use client";

import { Contact, FileFullInfo } from "bedrock-ts-sdk";
import { Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getAvatarUsernameUsernameAvatarGet } from "@/apis/usernames";
import { PublicFileShareModal } from "@/components/PublicFileShareModal";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FileShareModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (addedPubKeys: string[], removedPubKeys: string[]) => Promise<void>;
	onSharePublicly: () => Promise<void>;
	contacts: Contact[];
	file: FileFullInfo;
}

export function FileShareModal({
	isOpen,
	onClose,
	onSave,
	onSharePublicly,
	contacts,
	file,
}: Readonly<FileShareModalProps>) {
	// Serialize shared_with to detect content changes
	const sharedWithKey = (file.shared_with || []).sort().join(",");

	const [selectedPubKeys, setSelectedPubKeys] = useState<Set<string>>(() => new Set(file.shared_with || []));
	const [isPublicModalOpen, setIsPublicModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({});

	// Reset selected keys whenever the file's shared_with changes
	useEffect(() => {
		setSelectedPubKeys(new Set(file.shared_with || []));
	}, [sharedWithKey, file.shared_with]); // Use serialized key to detect actual content changes

	// Compute what the file currently has (for comparison)
	const initialSharedPubKeys = useMemo(() => new Set(file.shared_with || []), [file.shared_with]);

	// Fetch avatar URLs for all contacts
	useEffect(() => {
		const fetchAvatars = async () => {
			const urls: Record<string, string> = {};
			for (const contact of contacts) {
				try {
					const response = await getAvatarUsernameUsernameAvatarGet({
						path: { username: contact.name },
					});
					if (response.data) {
						urls[contact.public_key] = response.data;
					}
				} catch {
					// Avatar fetch failed, will use fallback
				}
			}
			setAvatarUrls(urls);
		};

		if (contacts.length > 0) {
			fetchAvatars();
		}
	}, [contacts]);

	const sharedContacts = useMemo(() => {
		return contacts.filter((c) => selectedPubKeys.has(c.public_key));
	}, [contacts, selectedPubKeys]);

	const availableContacts = useMemo(() => {
		return contacts.filter((c) => !selectedPubKeys.has(c.public_key));
	}, [contacts, selectedPubKeys]);

	const hasChanges = useMemo(() => {
		if (selectedPubKeys.size !== initialSharedPubKeys.size) return true;
		return Array.from(selectedPubKeys).some((pk) => !initialSharedPubKeys.has(pk));
	}, [selectedPubKeys, initialSharedPubKeys]);

	const addedPubKeys = useMemo(() => {
		return Array.from(selectedPubKeys).filter((pk) => !initialSharedPubKeys.has(pk));
	}, [selectedPubKeys, initialSharedPubKeys]);

	const removedPubKeys = useMemo(() => {
		return Array.from(initialSharedPubKeys).filter((pk) => !selectedPubKeys.has(pk));
	}, [selectedPubKeys, initialSharedPubKeys]);

	const handleAddContact = (pubKey: string) => {
		setSelectedPubKeys((prev) => new Set([...Array.from(prev), pubKey]));
	};

	const handleRemoveContact = (pubKey: string) => {
		setSelectedPubKeys((prev) => {
			const next = new Set(prev);
			next.delete(pubKey);
			return next;
		});
	};

	const handleSave = async () => {
		if (isLoading || !hasChanges) return;
		setIsLoading(true);
		try {
			await onSave(addedPubKeys, removedPubKeys);
			onClose();
		} finally {
			setIsLoading(false);
		}
	};

	const handlePublicShare = async () => {
		setIsPublicModalOpen(false);
		setIsLoading(true);
		try {
			await onSharePublicly();
			onClose();
		} finally {
			setIsLoading(false);
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

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
				onComplete={handlePublicShare}
			/>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Share &ldquo;{file.name}&rdquo;</DialogTitle>
					<DialogDescription>Manage who has access to this file.</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{sharedContacts.length > 0 && (
						<div className="space-y-2">
							<p className="text-sm text-muted-foreground">Currently shared with:</p>
							<div className="space-y-2 max-h-48 overflow-y-auto">
								{sharedContacts.map((contact) => (
									<div
										key={contact.public_key}
										className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
									>
										<div className="flex items-center gap-3">
											<Avatar
												src={avatarUrls[contact.public_key]}
												alt={getInitials(contact.name)}
												className="h-8 w-8"
											/>
											<span className="text-sm font-medium">{contact.name}</span>
										</div>
										<Button
											variant="ghost"
											size="sm"
											className="h-8 w-8 p-0"
											onClick={() => handleRemoveContact(contact.public_key)}
											disabled={isLoading}
										>
											<X size={16} />
										</Button>
									</div>
								))}
							</div>
						</div>
					)}

					{availableContacts.length > 0 && (
						<div className="space-y-2">
							<p className="text-sm text-muted-foreground">Add contact:</p>
							<Select onValueChange={handleAddContact} disabled={isLoading}>
								<SelectTrigger>
									<SelectValue placeholder="Select a contact" />
								</SelectTrigger>
								<SelectContent>
									{availableContacts.map((contact) => (
										<SelectItem key={contact.public_key} value={contact.public_key}>
											<div className="flex items-center gap-2">
												<Avatar
													src={avatarUrls[contact.public_key]}
													alt={getInitials(contact.name)}
													className="h-5 w-5"
												/>
												{contact.name}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					{contacts.length === 0 && (
						<p className="text-sm text-muted-foreground text-center py-4">
							No contacts available. Add contacts first to share files.
						</p>
					)}

					{removedPubKeys.length > 0 && (
						<p className="text-xs text-amber-600 dark:text-amber-500">
							Removing access will re-encrypt the file with a new key for security.
						</p>
					)}
				</div>

				<DialogFooter className="flex-col sm:flex-row gap-2">
					<Button
						variant="outline"
						onClick={() => setIsPublicModalOpen(true)}
						disabled={isLoading}
						className="sm:mr-auto"
					>
						Share publicly
					</Button>
					<Button variant="outline" onClick={onClose} disabled={isLoading}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={!hasChanges || isLoading} className="gap-2">
						{isLoading && <Loader2 size={16} className="animate-spin" />}
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
