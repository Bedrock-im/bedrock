import { Trash } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";

export type DrivePageTitleProps = {
	cwd: string;
	selectedItemsCount: number;
	onDelete: () => void;
};

export const DrivePageTitle: React.FC<DrivePageTitleProps> = ({ selectedItemsCount, onDelete, cwd }) => {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-4">
				<h1 className="text-2xl font-bold tracking-tight text-foreground">
					{selectedItemsCount > 0 ? (
						<span className="text-primary">
							{selectedItemsCount} item{selectedItemsCount > 1 ? "s" : ""} selected
						</span>
					) : cwd === "/" ? (
						"My Files"
					) : (
						cwd.split("/").filter(Boolean).pop()
					)}
				</h1>
				{selectedItemsCount > 0 && (
					<Button
						variant="ghost"
						size="sm"
						className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
						onClick={onDelete}
						aria-label="Delete selected items"
					>
						<Trash size={18} />
						<span className="ml-2">Delete</span>
					</Button>
				)}
			</div>
		</div>
	);
};
