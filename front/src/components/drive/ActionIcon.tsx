import { LucideIcon } from "lucide-react";
import { useState } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ActionIconProps {
	Icon: LucideIcon;
	onClick: () => void;
	tooltip: string;
}

export default function ActionIcon({ Icon, onClick, tooltip }: ActionIconProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleClick = () => {
		if (isLoading) return;

		setIsLoading(true);
		onClick();
		setTimeout(() => {
			setIsLoading(false);
		}, 100);
	};

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					aria-label={tooltip}
					disabled={isLoading}
					aria-busy={isLoading}
					onClick={handleClick}
					className={cn(
						"inline-flex items-center justify-center rounded-md p-1 transition-colors",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
						"disabled:pointer-events-none disabled:opacity-50",
						isLoading ? "cursor-progress" : "cursor-pointer hover:bg-accent hover:text-accent-foreground",
					)}
				>
					<Icon size={16} className="shrink-0" aria-hidden="true" />
				</button>
			</TooltipTrigger>
			<TooltipContent>
				<p>{tooltip}</p>
			</TooltipContent>
		</Tooltip>
	);
}
