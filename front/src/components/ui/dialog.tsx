"use client";

import { Root, Trigger, Portal, Close, Overlay, Content, Title, Description } from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import React from "react";

import { cn } from "@/lib/utils";

const Dialog = Root;
const DialogTrigger = Trigger;
const DialogPortal = Portal;
const DialogClose = Close;

const DialogOverlay = React.forwardRef<
	React.ElementRef<typeof Overlay>,
	React.ComponentPropsWithoutRef<typeof Overlay>
>(({ className, ...props }, ref) => (
	<Overlay
		ref={ref}
		className={cn(
			"fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
			className,
		)}
		{...props}
	/>
));
DialogOverlay.displayName = Overlay.displayName;

const DialogContent = React.forwardRef<
	React.ElementRef<typeof Content>,
	React.ComponentPropsWithoutRef<typeof Content>
>(({ className, children, ...props }, ref) => (
	<DialogPortal>
		<DialogOverlay />
		<Content
			ref={ref}
			className={cn(
				"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
				className,
			)}
			{...props}
		>
			{children}
			<Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground text-primary">
				<Cross2Icon className="h-4 w-4" />
				<span className="sr-only">Close</span>
			</Close>
		</Content>
	</DialogPortal>
));
DialogContent.displayName = Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<React.ElementRef<typeof Title>, React.ComponentPropsWithoutRef<typeof Title>>(
	({ className, ...props }, ref) => (
		<Title
			ref={ref}
			className={cn("text-lg font-semibold leading-none tracking-tight text-primary", className)}
			{...props}
		/>
	),
);
DialogTitle.displayName = Title.displayName;

const DialogDescription = React.forwardRef<
	React.ElementRef<typeof Description>,
	React.ComponentPropsWithoutRef<typeof Description>
>(({ className, ...props }, ref) => (
	<Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = Description.displayName;

export {
	Dialog,
	DialogPortal,
	DialogOverlay,
	DialogTrigger,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
};
