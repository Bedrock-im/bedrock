import React from "react";

import { cn } from "@/lib/utils";

import { Input, InputProps } from "./input";
import { Label } from "./label";

export interface FormFieldProps extends InputProps {
	label: string;
	error?: string;
	helperText?: string;
	fieldId: string;
}

/**
 * FormField component that wraps Input with proper ARIA associations for accessibility.
 *
 * Features:
 * - Automatic ID generation and linking for errors and helper text
 * - aria-invalid for error states
 * - aria-describedby linking to error/helper text
 * - aria-required for required fields
 * - role="alert" on error messages for immediate screen reader notification
 *
 * @example
 * <FormField
 *   label="Email"
 *   fieldId="email"
 *   type="email"
 *   required
 *   error={emailError}
 *   helperText="We'll never share your email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 */
export function FormField({ label, error, helperText, fieldId, required, className, ...inputProps }: FormFieldProps) {
	const errorId = `${fieldId}-error`;
	const helperId = `${fieldId}-helper`;
	const describedBy = [error ? errorId : null, helperText ? helperId : null].filter(Boolean).join(" ");

	return (
		<div className="space-y-2">
			<Label htmlFor={fieldId}>
				{label}
				{required && (
					<span aria-label="required" className="text-destructive ml-1">
						*
					</span>
				)}
			</Label>
			<Input
				id={fieldId}
				aria-invalid={!!error}
				aria-describedby={describedBy || undefined}
				aria-required={required}
				className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
				{...inputProps}
			/>
			{helperText && !error && (
				<p id={helperId} className="text-sm text-muted-foreground">
					{helperText}
				</p>
			)}
			{error && (
				<p id={errorId} role="alert" className="text-sm text-destructive font-medium">
					{error}
				</p>
			)}
		</div>
	);
}
