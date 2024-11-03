"use client";

import { CheckIcon } from "@radix-ui/react-icons";
import { Indicator, Item, Root } from "@radix-ui/react-radio-group";
import React from "react";

import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<React.ElementRef<typeof Root>, React.ComponentPropsWithoutRef<typeof Root>>(
	({ className, ...props }, ref) => {
		return <Root className={cn("grid gap-2", className)} {...props} ref={ref} />;
	},
);
RadioGroup.displayName = Root.displayName;

const RadioGroupItem = React.forwardRef<React.ElementRef<typeof Item>, React.ComponentPropsWithoutRef<typeof Item>>(
	({ className, ...props }, ref) => {
		return (
			<Item
				ref={ref}
				className={cn(
					"aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				{...props}
			>
				<Indicator className="flex items-center justify-center">
					<CheckIcon className="h-3.5 w-3.5 fill-primary" />
				</Indicator>
			</Item>
		);
	},
);
RadioGroupItem.displayName = Item.displayName;

export { RadioGroup, RadioGroupItem };
