"use client";

import { Save, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface EditableTextPreviewProps {
	fileUrl: string;
	filename: string;
	initialContent: string;
	onSave: (content: string) => Promise<void>;
	onCancel: () => void;
}

export default function EditableTextPreview({ initialContent, onSave, onCancel }: EditableTextPreviewProps) {
	const [content, setContent] = useState(initialContent);
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await onSave(content);
		} catch (error) {
			console.error("Failed to save:", error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="w-full flex flex-col h-full">
			<div className="flex justify-end gap-2 mb-4">
				<Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
					<X className="h-4 w-4 mr-2" />
					Cancel
				</Button>
				<Button size="sm" onClick={handleSave} disabled={isSaving}>
					<Save className="h-4 w-4 mr-2" />
					{isSaving ? "Saving..." : "Save"}
				</Button>
			</div>
			<Textarea
				value={content}
				onChange={(e) => setContent(e.target.value)}
				className="flex-1 min-h-[500px] font-mono text-sm resize-none"
				placeholder="Edit file content..."
			/>
		</div>
	);
}
