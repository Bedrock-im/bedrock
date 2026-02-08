import { TooltipProvider } from "@radix-ui/react-tooltip";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";

describe("Tooltip", () => {
	beforeEach(() => {
		// Suppress forwardRef warning which exists in the codebase
		jest.spyOn(console, "error").mockImplementation((msg) => {
			if (msg.includes("forwardRef render functions accept exactly two parameters")) return;
			// eslint-disable-next-line no-console
			console.warn(msg);
		});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("shows tooltip content on hover", async () => {
		render(
			<TooltipProvider>
				<Tooltip delayDuration={0}>
					<TooltipTrigger>Hover me</TooltipTrigger>
					<TooltipContent>Tooltip Content</TooltipContent>
				</Tooltip>
			</TooltipProvider>,
		);

		expect(screen.queryByText("Tooltip Content")).not.toBeInTheDocument();

		fireEvent.mouseEnter(screen.getByText("Hover me"));
		fireEvent.focus(screen.getByText("Hover me"));

		await waitFor(() => {
			const elements = screen.getAllByText("Tooltip Content");
			expect(elements.length).toBeGreaterThan(0);
			// One of them should be visible/in the document.
			// Radix renders a hidden one for screen readers.
		});
	});
});
