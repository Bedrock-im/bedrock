import { Trash } from "lucide-react";
import React from "react";

export type DrivePageTitleProps = {
	cwd: string;
	selectedItemsCount: number;
	onDelete: () => void;
};

export const DrivePageTitle: React.FC<DrivePageTitleProps> = ({ selectedItemsCount, onDelete, cwd }) => {
	return (
		<div className="drive-page-title">
			<div className="flex items-center space-x-4">
				<h1 className="text-2xl font-semibold">
					{selectedItemsCount > 0 ? `${selectedItemsCount} item${selectedItemsCount > 1 ? "s" : ""} selected` : cwd}
				</h1>
				{selectedItemsCount > 0 && (
					<button
						className="p-2 text-red-600 hover:bg-gray-100 rounded-full"
						onClick={onDelete}
						aria-label="Delete selected items"
					>
						<Trash size={20} />
					</button>
				)}
			</div>
		</div>
	);
};
