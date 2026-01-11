import * as Popover from "@radix-ui/react-popover";
import { Plus, FolderPlus, Upload } from "lucide-react";
import React from "react";

const UploadButton = ({
	onCreateFolder,
	getInputProps,
}: {
	onCreateFolder: () => void;
	getInputProps: () => object;
}) => {
	return (
		<Popover.Root>
			<Popover.Trigger asChild>
				<button
					className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
					aria-label="Add new"
				>
					<Plus size={18} className="transition-transform duration-300" />
					<span>New</span>
				</button>
			</Popover.Trigger>

			<Popover.Portal>
				<Popover.Content
					className="bg-card shadow-soft-lg rounded-xl p-1.5 w-52 flex flex-col border animate-scale-in z-50"
					side="bottom"
					align="start"
					sideOffset={8}
				>
					<button
						onClick={onCreateFolder}
						className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-sm font-medium text-foreground"
					>
						<div className="flex items-center justify-center size-8 rounded-lg bg-amber-100 text-amber-600">
							<FolderPlus size={16} />
						</div>
						<span>New Folder</span>
					</button>
					<label className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-lg cursor-pointer transition-colors text-sm font-medium text-foreground">
						<div className="flex items-center justify-center size-8 rounded-lg bg-green-100 text-green-600">
							<Upload size={16} />
						</div>
						<span>Upload File</span>
						<input {...getInputProps()} className="hidden" />
					</label>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
};

export default UploadButton;
