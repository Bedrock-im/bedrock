import { useState } from "react";

import FileList from "@/components/drive/FileList";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { KnowledgeBase } from "@/stores/knowledge-bases";

export type KnowledgeBaseFileSelectorProps = {
	onOpenChange: (open: boolean) => void;
	onSave: (newFilePaths: string[]) => void;
	knowledgeBase: KnowledgeBase | null;
};

export default function KnowledgeBaseFileSelector({
	onOpenChange,
	onSave,
	knowledgeBase,
}: KnowledgeBaseFileSelectorProps) {
	const [selectedPaths, setSelectedFilePaths] = useState(knowledgeBase?.filePaths ?? []);

	const handleSave = () => {
		onSave(selectedPaths);
		onOpenChange(false);
	};

	return (
		<Dialog open={knowledgeBase !== null} onOpenChange={onOpenChange}>
			{knowledgeBase !== null && (
				<DialogContent className="max-w-[75vw] max-h-[75vh]">
					<DialogHeader>
						<DialogTitle>Select files for &quot;{knowledgeBase.name}&quot;</DialogTitle>
						<DialogDescription>Select files to include in the knowledge base.</DialogDescription>
					</DialogHeader>
					<FileList
						emptyMessage="Your drive is empty."
						selectedPaths={selectedPaths}
						onSelectedItemPathsChange={(newPaths) =>
							setSelectedFilePaths(Array.from(newPaths).filter((path) => !path.endsWith("/")))
						}
					/>
					<DialogFooter className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button onClick={() => handleSave()}>Save</Button>
					</DialogFooter>
				</DialogContent>
			)}
		</Dialog>
	);
}
