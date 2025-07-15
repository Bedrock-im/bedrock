import { Copy, CornerDownLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ChatBubble, ChatBubbleAction, ChatBubbleMessage } from "@/components/ui/chat/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAccountStore } from "@/stores/account";
import { useDriveStore } from "@/stores/drive";
import { KnowledgeBase } from "@/stores/knowledge-bases";

export type KnowledgeBaseAskDialogProps = {
	knowledgeBase: KnowledgeBase | null;
	onOpenChange: (open: boolean) => void;
};

type Message = {
	type: "received" | "sent";
	message: string;
};

export default function KnowledgeBaseAskDialog({ knowledgeBase, onOpenChange }: KnowledgeBaseAskDialogProps) {
	const [messageToSend, setMessageToSend] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const { libertaiService } = useAccountStore();
	const { files } = useDriveStore();

	const handleSendMessage = () => {
		if (messageToSend.trim() === "") {
			return;
		}
		setMessages((prev) => [...prev, { type: "sent", message: messageToSend }]);
		if (!knowledgeBase || !libertaiService) {
			toast.error("Knowledge base or LibertAI service not available");
			return;
		}
		libertaiService
			.askKnowledgeBase(
				messageToSend,
				knowledgeBase.filePaths
					.map((path) => ({
						file: files.find((file) => file.path === path),
						filePath: path,
					}))
					.filter(({ file }) => !!file)
					.map(({ filePath, file }) => ({ filePath, content: file!.content ?? Buffer.from("</unknown>") })),
				messages.map(({ type, message }) => ({
					role: type === "sent" ? "user" : "assistant",
					content: message,
				})),
			)
			.then((response) => {
				setMessages((prev) => [...prev, { type: "received", message: response.at(-1)!.content as string }]);
			})
			.catch((error) => {
				toast.error(`Error asking knowledge base: ${error.message}`);
				setMessages((prev) => [
					...prev,
					{ type: "received", message: "An error occurred while processing your request." },
				]);
			});
		setMessageToSend("");
	};

	const handleCopyReceivedMessage = (message: string) => {
		toast.promise(navigator.clipboard.writeText(message), {
			error: "Could not copy message to clipboard",
			success: "Copied message to clipboard",
		});
	};

	return (
		<Dialog open={knowledgeBase !== null} onOpenChange={onOpenChange}>
			{knowledgeBase !== null && (
				<DialogContent className="min-w-[90vw] min-h-[90vh] max-h-[90vh] max-w-[90vw] overflow-y-scroll">
					<DialogHeader>
						<DialogTitle>Ask base &quot;{knowledgeBase.name}&quot;</DialogTitle>
						<DialogDescription>
							Ask any questions about the content of the files present in this knowledge base.
						</DialogDescription>
					</DialogHeader>
					<ChatMessageList>
						{messages.map(({ message, type }, idx) => (
							<ChatBubble
								key={idx}
								layout={type === "sent" ? "default" : "ai"}
								variant={type}
								className="flex-col items-start"
							>
								<ChatBubbleMessage>{message}</ChatBubbleMessage>
								{type === "received" && (
									<div className="flex gap-3">
										<ChatBubbleAction
											className="size-6"
											icon={<Copy />}
											onClick={() => handleCopyReceivedMessage(message)}
										/>
									</div>
								)}
							</ChatBubble>
						))}
						{messages.at(-1)?.type === "sent" && (
							<ChatBubble layout="ai" variant="received">
								<ChatBubbleMessage isLoading />
							</ChatBubble>
						)}
					</ChatMessageList>
					<div className="flex flex-col gap-3.5 relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1">
						<Textarea
							id="message"
							autoComplete="off"
							className="flex-grow px-4 py-3 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center resize-none"
							onChange={(e) => setMessageToSend(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
							value={messageToSend}
							placeholder="Type your question here"
							disabled={messages.at(-1)?.type === "sent"}
						/>
						<Button
							size="sm"
							className="ml-auto gap-1.5"
							onClick={() => handleSendMessage()}
							disabled={messages.at(-1)?.type === "sent"}
						>
							Send Message
							<CornerDownLeft className="size-3.5" />
						</Button>
					</div>
				</DialogContent>
			)}
		</Dialog>
	);
}
