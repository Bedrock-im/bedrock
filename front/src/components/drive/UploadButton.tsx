import * as Popover from "@radix-ui/react-popover";
import { Plus, FolderPlus, Upload } from "lucide-react";
import React from "react";

// eslint-disable-next-line
const UploadButton = ({ onCreateFolder, getInputProps }: { onCreateFolder: () => void; getInputProps: any }) => {
	return (
		<Popover.Root>
			<Popover.Trigger asChild>
				<button
					className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center"
					aria-label="Add"
				>
					<Plus size={28} className="transition-transform duration-300 transform group-hover:rotate-90" />
				</button>
			</Popover.Trigger>

			<Popover.Portal>
				<Popover.Content
					className="bg-white shadow-lg rounded-lg p-2 w-48 flex flex-col border border-gray-200"
					side="right"
					align="center"
					sideOffset={8}
				>
					<button onClick={onCreateFolder} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md">
						<FolderPlus size={18} className="text-blue-500" /> Create Folder
					</button>
					<label className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer">
						<Upload size={18} className="text-green-500" /> Upload File
						<input {...getInputProps()} className="hidden" />
					</label>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
};

export default UploadButton;
