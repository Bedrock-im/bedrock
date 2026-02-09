"use client";

import React, { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface LiveRegionProps {
	message: string;
	politeness?: "polite" | "assertive";
	clearAfter?: number;
	className?: string;
}

/**
 * LiveRegion component for announcing dynamic content changes to screen readers.
 *
 * @param message - The message to announce to screen readers
 * @param politeness - "polite" (default) waits for user to pause, "assertive" interrupts immediately
 * @param clearAfter - Time in milliseconds to clear the message (0 = never clear, default: 5000)
 * @param className - Additional CSS classes (typically sr-only for visual hiding)
 *
 * @example
 * // Announce a file upload completion
 * <LiveRegion message="File uploaded successfully" politeness="polite" />
 *
 * @example
 * // Announce an error that needs immediate attention
 * <LiveRegion message="Error: Connection lost" politeness="assertive" />
 */
export function LiveRegion({ message, politeness = "polite", clearAfter = 5000, className }: LiveRegionProps) {
	const regionRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (clearAfter > 0 && message) {
			const timer = setTimeout(() => {
				if (regionRef.current) {
					regionRef.current.textContent = "";
				}
			}, clearAfter);
			return () => clearTimeout(timer);
		}
	}, [message, clearAfter]);

	if (!message) return null;

	return (
		<div ref={regionRef} role="status" aria-live={politeness} aria-atomic="true" className={cn("sr-only", className)}>
			{message}
		</div>
	);
}
