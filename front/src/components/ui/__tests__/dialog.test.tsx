import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
} from "../dialog";

// Mock ResizeObserver which is used by Radix UI
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};

describe("Dialog", () => {
	it("renders dialog trigger and opens content on click", async () => {
		render(
			<Dialog>
				<DialogTrigger>Open Dialog</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Dialog Title</DialogTitle>
						<DialogDescription>Dialog Description</DialogDescription>
					</DialogHeader>
					<p>Dialog Body</p>
					<DialogFooter>
						<DialogClose>Close</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>,
		);

		expect(screen.queryByText("Dialog Title")).not.toBeInTheDocument();

		fireEvent.click(screen.getByText("Open Dialog"));

		await waitFor(() => {
			expect(screen.getByText("Dialog Title")).toBeInTheDocument();
		});

		expect(screen.getByText("Dialog Description")).toBeInTheDocument();
		expect(screen.getByText("Dialog Body")).toBeInTheDocument();
	});
});
