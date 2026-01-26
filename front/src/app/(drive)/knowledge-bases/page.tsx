"use client";
import { BookOpen, Edit, FilePlus2, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import ActionIcon from "@/components/drive/ActionIcon";
import DeleteDialog from "@/components/drive/DeleteDialog";
import KnowledgeBaseAskDialog from "@/components/drive/KnowledgeBaseAskDialog";
import KnowledgeBaseFileSelector from "@/components/drive/KnowledgeBaseFileSelector";
import RenameDialog from "@/components/drive/RenameDialog";
import { TableSkeleton } from "@/components/drive/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAccountStore } from "@/stores/account";
import { useDriveStore } from "@/stores/drive";
import { KnowledgeBase, useKnowledgeBaseStore } from "@/stores/knowledge-bases";

export const dynamic = "force-dynamic";

export default function KnowledgeBases() {
	const [openedAskKBModal, setOpenedAskKBModal] = useState<KnowledgeBase | null>(null);
	const [openedRenameKBModal, setOpenedRenameKBModal] = useState<KnowledgeBase | null>(null);
	const [openedDeleteKBModal, setOpenedDeleteKBModal] = useState<KnowledgeBase | null>(null);
	const [openedModifyFileListKBModal, setOpenedModifyFileListKBModal] = useState<KnowledgeBase | null>(null);
	const [openNewKBModal, setOpenNewKBModal] = useState(false);
	const [newKBName, setNewKBName] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const { bedrockClient } = useAccountStore();
	const { files, updateFileContent } = useDriveStore();
	const {
		knowledgeBases,
		renameKnowledgeBase,
		removeKnowledgeBase,
		addKnowledgeBase,
		setKnowledgeBaseFiles,
		setKnowledgeBases,
	} = useKnowledgeBaseStore();

	useEffect(() => {
		if (!bedrockClient) return;
		setIsLoading(true);
		(async () => {
			try {
				const knowledgeBases: KnowledgeBase[] = (await bedrockClient.knowledgeBases.listKnowledgeBases()).map(
					({ name, file_paths, created_at, updated_at }) => ({
						name,
						filePaths: file_paths,
						created_at: new Date(created_at),
						updated_at: new Date(updated_at),
					}),
				);

				setKnowledgeBases(knowledgeBases);
			} finally {
				setIsLoading(false);
			}
		})();
	}, [bedrockClient, setKnowledgeBases]);

	const handleSearchKBModalOpening = async (base: KnowledgeBase) => {
		if (openedAskKBModal !== null) return;
		(
			await Promise.all(
				base.filePaths
					.filter((filePath) => !!files.find(({ path, content }) => path === filePath && content === undefined))
					.map(async (filePath) => {
						const driveFile = files.find(({ path }) => path === filePath)!;
						return {
							path: filePath,
							newContent: await bedrockClient!.files.downloadFile(driveFile),
						};
					}),
			)
		).forEach(({ newContent, path }) => updateFileContent(path, newContent));
		setOpenedAskKBModal(base);
	};

	const handleRenameBaseModalOpening = (base: KnowledgeBase) => {
		if (openedRenameKBModal !== null) return;
		setOpenedRenameKBModal(base);
	};

	const handleDeleteBaseModalOpening = (base: KnowledgeBase) => {
		if (openedDeleteKBModal !== null) return;
		setOpenedDeleteKBModal(base);
	};

	const handleModifyFileListToBaseModalOpening = (base: KnowledgeBase) => {
		if (openedModifyFileListKBModal !== null) return;
		setOpenedModifyFileListKBModal(base);
	};

	const handleCreateKnowledgeBase = async () => {
		try {
			const trimmedName = newKBName.trim();
			if (!trimmedName) {
				toast.error("Knowledge base name cannot be empty");
				return;
			}

			await bedrockClient?.knowledgeBases.createKnowledgeBase(trimmedName);
			addKnowledgeBase({
				name: trimmedName,
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

	const handleDelete = async (kb: KnowledgeBase) => {
		try {
			await bedrockClient?.knowledgeBases.deleteKnowledgeBase(kb.name);
			removeKnowledgeBase(kb.name);
			toast.success(`Knowledge base "${kb.name}" deleted successfully`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to delete knowledge base");
		}
	};

	const handleRename = async (newName: string, kb: KnowledgeBase) => {
		try {
			await bedrockClient?.knowledgeBases.renameKnowledgeBase(kb.name, newName);
			renameKnowledgeBase(kb.name, newName);
			toast.success(`Knowledge base renamed to "${newName}"`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to rename knowledge base");
		}
	};

	const handleFileSelection = async (newFilePaths: string[], kb: KnowledgeBase) => {
		await bedrockClient?.knowledgeBases.setFiles(kb.name, newFilePaths);

		(
			await Promise.all(
				newFilePaths
					.filter((filePath) => !!files.find(({ path }) => path === filePath))
					.map(async (filePath) => {
						const driveFile = files.find(({ path }) => path === filePath)!;
						return {
							path: filePath,
							newContent: await bedrockClient!.files.downloadFile(driveFile),
						};
					}),
			)
		).forEach(({ newContent, path }) => updateFileContent(path, newContent));
		setKnowledgeBaseFiles(kb.name, ...newFilePaths);
		toast.success(`Files updated for "${kb.name}"`);
	};

	const filteredKnowledgeBases = knowledgeBases.filter((kb) =>
		kb.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<div className="p-2">
			<div className="flex justify-between items-center m-2 gap-4">
				<Button onClick={() => setOpenNewKBModal(true)} className="gap-2">
					<Plus size={16} />
					New Knowledge Base
				</Button>
				<Input
					type="text"
					placeholder="Search knowledge bases..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="rounded-xl flex-1"
				/>
			</div>
			<Card className="m-2 shadow-soft rounded-xl border-0 bg-card overflow-hidden">
				<div className="m-4 mt-2">
					<h2 className="text-lg font-semibold py-2">Knowledge Bases</h2>
					<Separator orientation="horizontal" />
				</div>
				{isLoading ? (
					<TableSkeleton
						columns={6}
						rows={4}
						headers={["Name", "Files", "Size", "Created", "Last edited", "Actions"]}
					/>
				) : filteredKnowledgeBases.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 text-center">
						<div className="size-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
							<BookOpen className="size-8 text-muted-foreground/50" />
						</div>
						{searchQuery ? (
							<p className="text-muted-foreground">No knowledge bases match your search.</p>
						) : (
							<>
								<p className="text-muted-foreground font-medium">No knowledge bases yet</p>
								<p className="text-sm text-muted-foreground/70 mt-1">
									Create a knowledge base to organize and query your files with AI
								</p>
							</>
						)}
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Files</TableHead>
								<TableHead>Size</TableHead>
								<TableHead>Created</TableHead>
								<TableHead>Last edited</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredKnowledgeBases.map((base) => (
								<TableRow key={base.name}>
									<TableCell className="font-medium">{base.name}</TableCell>
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
										<ActionIcon Icon={Search} tooltip="Search" onClick={() => handleSearchKBModalOpening(base)} />
										<ActionIcon
											Icon={FilePlus2}
											tooltip="Modify file list"
											onClick={() => handleModifyFileListToBaseModalOpening(base)}
										/>
										<ActionIcon Icon={Edit} tooltip="Rename" onClick={() => handleRenameBaseModalOpening(base)} />
										<ActionIcon Icon={Trash2} tooltip="Delete" onClick={() => handleDeleteBaseModalOpening(base)} />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</Card>
			{openedAskKBModal !== null && (
				<KnowledgeBaseAskDialog
					knowledgeBase={openedAskKBModal}
					onOpenChange={(open) => !open && setOpenedAskKBModal(null)}
				/>
			)}
			{openedModifyFileListKBModal && (
				<KnowledgeBaseFileSelector
					knowledgeBase={openedModifyFileListKBModal}
					onOpenChange={(open) => !open && setOpenedModifyFileListKBModal(null)}
					onSave={(newFilePaths) => handleFileSelection(newFilePaths, openedModifyFileListKBModal)}
				/>
			)}
			{openedRenameKBModal && (
				<RenameDialog
					name={openedRenameKBModal.name}
					onOpenChange={(open) => !open && setOpenedRenameKBModal(null)}
					onRename={(newName) => handleRename(newName, openedRenameKBModal)}
					open={true}
				/>
			)}
			{openedDeleteKBModal && (
				<DeleteDialog
					open={true}
					onOpenChange={(open) => !open && setOpenedDeleteKBModal(null)}
					onDelete={() => handleDelete(openedDeleteKBModal)}
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
							autoFocus
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setOpenNewKBModal(false)}>
							Cancel
						</Button>
						<Button onClick={handleCreateKnowledgeBase} disabled={!newKBName.trim()}>
							Create
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
