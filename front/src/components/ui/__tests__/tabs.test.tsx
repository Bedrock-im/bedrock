import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};

describe("Tabs", () => {
	it("renders tabs and switches content", async () => {
		render(
			<Tabs defaultValue="tab1">
				<TabsList>
					<TabsTrigger value="tab1">Tab 1</TabsTrigger>
					<TabsTrigger value="tab2">Tab 2</TabsTrigger>
				</TabsList>
				<TabsContent value="tab1">Content 1</TabsContent>
				<TabsContent value="tab2">Content 2</TabsContent>
			</Tabs>,
		);

		expect(screen.getByText("Content 1")).toBeInTheDocument();
		expect(screen.queryByText("Content 2")).not.toBeInTheDocument();

		const tab2 = screen.getByText("Tab 2");
		fireEvent.mouseDown(tab2);
		fireEvent.click(tab2);

		await waitFor(() => {
			expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
			expect(screen.getByText("Content 2")).toBeInTheDocument();
		});
	});
});
