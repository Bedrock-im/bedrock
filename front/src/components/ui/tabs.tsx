"use client";

import { List, Root, Trigger, Content } from "@radix-ui/react-tabs";
import React from "react";

import { cn } from "@/lib/utils";

const Tabs = Root;

const TabsList = React.forwardRef<React.ElementRef<typeof List>, React.ComponentPropsWithoutRef<typeof List>>(
	({ className, ...props }, ref) => (
		<List
			ref={ref}
			className={cn(
				"inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
				className,
			)}
			{...props}
		/>
	),
);
TabsList.displayName = List.displayName;

const TabsTrigger = React.forwardRef<React.ElementRef<typeof Trigger>, React.ComponentPropsWithoutRef<typeof Trigger>>(
	({ className, ...props }, ref) => (
		<Trigger
			ref={ref}
			className={cn(
				"inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
				className,
			)}
			{...props}
		/>
	),
);
TabsTrigger.displayName = Trigger.displayName;

const TabsContent = React.forwardRef<React.ElementRef<typeof Content>, React.ComponentPropsWithoutRef<typeof Content>>(
	({ className, ...props }, ref) => (
		<Content
			ref={ref}
			className={cn(
				"mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				className,
			)}
			{...props}
		/>
	),
);
TabsContent.displayName = Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
