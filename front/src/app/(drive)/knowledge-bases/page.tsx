"use client";
import { Edit, FilePlus2, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import ActionIcon from "@/components/drive/ActionIcon";
import DeleteDialog from "@/components/drive/DeleteDialog";
import KnowledgeBaseAskDialog from "@/components/drive/KnowledgeBaseAskDialog";
import RenameDialog from "@/components/drive/RenameDialog";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAccountStore } from "@/stores/account";
import { useDriveStore } from "@/stores/drive";
import { KnowledgeBase, useKnowledgeBaseStore } from "@/stores/knowledge-bases";

export default function KnowledgeBases() {
	const [openedAskKBModal, setOpenedAskKBModal] = useState<KnowledgeBase | null>(null);
	const [openedRenameKBModal, setOpenedRenameKBModal] = useState<KnowledgeBase | null>(null);
	const [openedDeleteKBModal, setOpenedDeleteKBModal] = useState<KnowledgeBase | null>(null);
	const [openNewKBModal, setOpenNewKBModal] = useState(false);
	const [newKBName, setNewKBName] = useState("");
	const { bedrockService } = useAccountStore();
	const { files } = useDriveStore();
	const { knowledgeBases, renameKnowledgeBase, removeKnowledgeBase, addKnowledgeBase } = useKnowledgeBaseStore();

	const handleSearch = (base: KnowledgeBase) => {
		if (openedAskKBModal !== null) return;
		setOpenedAskKBModal(base);
	};

	const handleRenameBase = (base: KnowledgeBase) => {
		if (openedRenameKBModal !== null) return;
		setOpenedRenameKBModal(base);
	};

	const handleDeleteBase = (base: KnowledgeBase) => {
		if (openedDeleteKBModal !== null) return;
		setOpenedDeleteKBModal(base);
	};

	const handleAddFilesToBase = (base: KnowledgeBase) => {
		throw new Error("Function not implemented.");
	};

	const handleCreateKnowledgeBase = () => {
		try {
			if (!newKBName.trim()) {
				toast.error("Knowledge base name cannot be empty");
				return;
			}

			addKnowledgeBase({
				name: newKBName.trim(),
				filePaths: [],
				created_at: new Date(),
				updated_at: new Date(),
			});

			toast.success(`Knowledge base "${newKBName}" created successfully`);
			setNewKBName("");
			setOpenNewKBModal(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to create knowledge base");
		}
	};

	return (
		<section className="p-10">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-bold">Knowledge Bases</h2>
				<Button onClick={() => setOpenNewKBModal(true)} className="flex items-center gap-1">
					<Plus className="h-4 w-4" /> New Knowledge Base
				</Button>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[40px]">Name</TableHead>
						<TableHead className="w-[40px]">Files</TableHead>
						<TableHead className="w-[40px]">Size</TableHead>
						<TableHead className="w-[40px]">Created</TableHead>
						<TableHead className="w-[40px]">Last edited</TableHead>
						<TableHead className="w-[40px] text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{knowledgeBases.map((base) => (
						<TableRow key={base.name}>
							<TableCell>{base.name}</TableCell>
							<TableCell>{base.filePaths.length}</TableCell>
							<TableCell>
								{base.filePaths.reduce(
									(size, filePath) => size + (files.find(({ path }) => filePath == path)?.size ?? 0),
									0,
								)}
							</TableCell>
							<TableCell>{base.created_at.toLocaleDateString()}</TableCell>
							<TableCell>{base.updated_at.toLocaleDateString()}</TableCell>
							<TableCell className="flex justify-end items-center gap-2 mt-1">
								<ActionIcon Icon={Search} tooltip="Search" onClick={() => handleSearch(base)} />
								<ActionIcon Icon={FilePlus2} tooltip="Add files" onClick={() => handleAddFilesToBase(base)} />
								<ActionIcon Icon={Edit} tooltip="Rename" onClick={() => handleRenameBase(base)} />
								<ActionIcon Icon={Trash2} tooltip="Delete" onClick={() => handleDeleteBase(base)} />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<KnowledgeBaseAskDialog
				knowledgeBase={openedAskKBModal}
				onOpenChange={(open) => !open && setOpenedAskKBModal(null)}
			/>
			{openedRenameKBModal && (
				<RenameDialog
					name={openedRenameKBModal.name}
					onOpenChange={(open) => !open && setOpenedRenameKBModal(null)}
					onRename={(newName) => renameKnowledgeBase(openedRenameKBModal.name, newName)}
					open={true}
				/>
			)}
			{openedDeleteKBModal && (
				<DeleteDialog
					open={true}
					onOpenChange={(open) => !open && setOpenedDeleteKBModal(null)}
					onDelete={() => {
						try {
							removeKnowledgeBase(openedDeleteKBModal.name);
							toast.success(`Knowledge base "${openedDeleteKBModal.name}" deleted successfully`);
						} catch (error) {
							toast.error(error instanceof Error ? error.message : "Failed to delete knowledge base");
						}
					}}
					title="Delete knowledge base"
					description={`Are you sure you want to delete "${openedDeleteKBModal.name}"? This action cannot be undone.`}
				/>
			)}
			<Dialog open={openNewKBModal} onOpenChange={setOpenNewKBModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Knowledge Base</DialogTitle>
						<DialogDescription>
							Enter a name for your new knowledge base. You can add files to it later.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Input
							value={newKBName}
							onChange={(e) => setNewKBName(e.target.value)}
							placeholder="Knowledge Base Name"
							className="w-full"
							onKeyDown={(e) => e.key === "Enter" && handleCreateKnowledgeBase()}
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setOpenNewKBModal(false)}>
							Cancel
						</Button>
						<Button onClick={handleCreateKnowledgeBase}>Create</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</section>
	);
}
