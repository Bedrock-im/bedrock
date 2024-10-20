"use client";

import { Avatar as RadixAvatar, AvatarImage, Fallback } from "@radix-ui/react-avatar";
import React from "react";

import { cn } from "@/lib/utils";

export type AvatarProps = React.ImgHTMLAttributes<HTMLImageElement>;

const Avatar = React.forwardRef<React.ElementRef<typeof AvatarImage>, AvatarProps>(
	({ className, src, alt, ...props }, ref) => (
		<RadixAvatar>
			<AvatarImage className={cn("rounded-full h-12 w-12", className)} ref={ref} src={src} alt={alt} {...props} />
			<Fallback
				className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary", className)}
				ref={ref}
				{...props}
			>
				{alt}
			</Fallback>
		</RadixAvatar>
	),
);
Avatar.displayName = "Avatar";

export { Avatar };
