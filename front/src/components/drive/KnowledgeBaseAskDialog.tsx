import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KnowledgeBase } from "@/stores/knowledge-bases";

export type KnowledgeBaseAskDialogProps = {
	knowledgeBase: KnowledgeBase | null;
	onOpenChange: (open: boolean) => void;
};

export default function KnowledgeBaseAskDialog({ knowledgeBase, onOpenChange }: KnowledgeBaseAskDialogProps) {
	return (
		<Dialog open={knowledgeBase !== null} onOpenChange={onOpenChange}>
			{knowledgeBase !== null && (
				<DialogContent className="min-w-[90vw] min-h-[90vh]">
					<DialogHeader>
						<DialogTitle>Ask base &quot;{knowledgeBase.name}&quot;</DialogTitle>
						<DialogDescription>
							Ask any questions about the content of the files present in this knowledge base.
						</DialogDescription>
					</DialogHeader>
				</DialogContent>
			)}
		</Dialog>
	);
}
