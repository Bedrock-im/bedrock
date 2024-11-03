"use client";

import { Indicator, Root } from "@radix-ui/react-progress";
import React from "react";

import { cn } from "@/lib/utils";

export type ProgressProps = React.ComponentPropsWithoutRef<typeof Root>;

const Progress = React.forwardRef<React.ElementRef<typeof Root>, ProgressProps>(
	({ className, value, ...props }, ref) => (
		<Root
			ref={ref}
			className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
			{...props}
		>
			<Indicator
				className="h-full w-full flex-1 bg-primary transition-all"
				style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
			/>
		</Root>
	),
);
Progress.displayName = Root.displayName;

export { Progress };
