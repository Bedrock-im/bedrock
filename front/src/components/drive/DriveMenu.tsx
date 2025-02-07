import { ReactNode } from "react";

import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface DriveMenuProps {
	children: ReactNode;
}

export const DriveMenu = ({ children }: DriveMenuProps) => {
	return (
		<ContextMenu>
			<ContextMenuTrigger>{children}</ContextMenuTrigger>
			<ContextMenuContent /* className={args.dark ? "dark" : ""} FIXME: Manually add dark mode */>
				<ContextMenuItem inset disabled>
					Download
				</ContextMenuItem>
				<ContextMenuItem inset disabled>
					Move
				</ContextMenuItem>
				<ContextMenuItem inset disabled>
					Duplicate
				</ContextMenuItem>
				<ContextMenuItem inset disabled>
					Rename
				</ContextMenuItem>
				<ContextMenuItem inset disabled>
					Share
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem inset disabled>
					Properties
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
};
