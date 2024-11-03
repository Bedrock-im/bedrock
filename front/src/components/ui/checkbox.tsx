"use client";

import { Indicator, Root } from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import React from "react";

import { cn } from "@/lib/utils";

export type CheckboxProps = React.ComponentPropsWithoutRef<typeof Root>;

const Checkbox = React.forwardRef<React.ElementRef<typeof Root>, CheckboxProps>(({ className, ...props }, ref) => (
	<Root
		ref={ref}
		className={cn(
			"peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
			className,
		)}
		{...props}
	>
		<Indicator className={cn("items-center justify-center text-current")}>
			<CheckIcon className="h-full w-full" />
		</Indicator>
	</Root>
));
Checkbox.displayName = Root.displayName;

export { Checkbox };
