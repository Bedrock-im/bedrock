import { ReactNode, useState } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface IconProps {
	className: string;
	color: string;
	onClick: () => void;
	size: number;
}

interface ActionIconProps {
	Icon: (props: IconProps) => ReactNode;
	onClick: () => void;
	tooltip: string;
}

export default function ActionIcon({ Icon, onClick, tooltip }: ActionIconProps) {
	const [isLoading, setIsLoading] = useState(false);

	return (
		<Tooltip>
			<TooltipTrigger>
				<Icon
					size={16}
					color={isLoading ? "gray" : "black"}
					className={isLoading ? "hover:cursor-progress" : "hover:cursor-pointer"}
					onClick={() => {
						if (isLoading) return;

						setIsLoading(true);
						onClick();
						setTimeout(() => {
							setIsLoading(false);
						}, 100);
					}}
				/>
			</TooltipTrigger>
			<TooltipContent>
				<p>{tooltip}</p>
			</TooltipContent>
		</Tooltip>
	);
}
