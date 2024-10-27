"use client";

import { Root } from "@radix-ui/react-separator";
import React from "react";

import { cn } from "@/lib/utils";

export type SeparatorProps = React.ComponentPropsWithoutRef<typeof Root>;

const Separator = React.forwardRef<React.ElementRef<typeof Root>, SeparatorProps>(
	({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
		<Root
			ref={ref}
			decorative={decorative}
			orientation={orientation}
			className={cn(
				"shrink-0 bg-border",
				orientation === "horizontal" ? "h-[1px] w-full" : "min-h-full w-[1px]",
				className,
			)}
			{...props}
		/>
	),
);
Separator.displayName = Root.displayName;

export { Separator };
