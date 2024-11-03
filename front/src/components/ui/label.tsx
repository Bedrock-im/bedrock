"use client";

import { Root } from "@radix-ui/react-label";
import React from "react";

import { cn } from "@/lib/utils";

export type LabelProps = React.ComponentPropsWithoutRef<typeof Root>;

const Label = React.forwardRef<React.ElementRef<typeof Root>, LabelProps>(({ className, ...props }, ref) => (
	<Root
		ref={ref}
		className={cn(
			"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary",
			className,
		)}
		{...props}
	/>
));
Label.displayName = Root.displayName;

export { Label };
