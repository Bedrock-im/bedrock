"use client";

import {
	Root,
	Trigger,
	Content,
	Portal,
	TooltipProps as RadixTooltipProps, Provider
} from "@radix-ui/react-tooltip";
import React from "react";

import { cn } from "@/lib/utils";

export type TooltipProps = RadixTooltipProps & {
	skipDelayDuration?: number;
}

const Tooltip = React.forwardRef<
	React.ElementRef<typeof Root>,
	TooltipProps
>(({ delayDuration, skipDelayDuration, disableHoverableContent, ...props }) => (
	<Provider
		delayDuration={delayDuration}
		skipDelayDuration={skipDelayDuration}
		disableHoverableContent={disableHoverableContent}
	>
		<Root
			delayDuration={delayDuration}
			disableHoverableContent={disableHoverableContent}
			{...props}
		/>
	</Provider>
))
Tooltip.displayName = Root.displayName;

const TooltipTrigger = React.forwardRef<
	React.ElementRef<typeof Trigger>,
	React.ComponentPropsWithoutRef<typeof Trigger>
>(({ className, ...props }, ref) => (
	<Trigger
		className={cn("text-primary", className)}
		ref={ref}
		{...props}
	/>
));
TooltipTrigger.displayName = Trigger.displayName;

const TooltipContent = React.forwardRef<
	React.ElementRef<typeof Content>,
	React.ComponentPropsWithoutRef<typeof Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
	<Portal>
		<Content
			ref={ref}
			sideOffset={sideOffset}
			className={cn(
				"z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
				className,
			)}
			{...props}
		/>
	</Portal>
));
TooltipContent.displayName = Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent };
