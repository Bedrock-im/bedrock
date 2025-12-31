"use client";

import { CopyIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

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
import env from "@/config/env";

export interface PublicFileLinkProps {
	hash: string;
	isOpen: boolean;
	onClose: () => void;
}

export function PublicFileLinkModal({ hash, isOpen, onClose }: Readonly<PublicFileLinkProps>) {
	const url = `${env.BASE_URL}/public/${hash}`;
	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(url);
			toast.success("File URL copied to clipboard");
		} catch (_err) {
			toast.error("Copy failed");
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(b) => {
				if (!b) onClose();
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>File shared!</DialogTitle>
					<DialogDescription>Your file is now available to anyone through this link.</DialogDescription>
				</DialogHeader>
				<Input type="text" id="public-key" value={url} className="pr-10" disabled />
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="absolute right-0 top-0 h-full px-2"
					onClick={copyToClipboard}
					aria-label="Copy sensitive data to clipboard"
				>
					<CopyIcon className="h-4 w-4" />
				</Button>
				<DialogFooter className="justify-end">
					<Button onClick={onClose}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
