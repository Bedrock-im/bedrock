import { render, screen } from "@testing-library/react";
import React from "react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../card";

describe("Card", () => {
	it("renders card with all subcomponents", () => {
		render(
			<Card>
				<CardHeader>
					<CardTitle>Card Title</CardTitle>
					<CardDescription>Card Description</CardDescription>
				</CardHeader>
				<CardContent>Card Content</CardContent>
				<CardFooter>Card Footer</CardFooter>
			</Card>,
		);

		expect(screen.getByText("Card Title")).toBeInTheDocument();
		expect(screen.getByText("Card Description")).toBeInTheDocument();
		expect(screen.getByText("Card Content")).toBeInTheDocument();
		expect(screen.getByText("Card Footer")).toBeInTheDocument();
	});

	it("applies custom classes", () => {
		const { container } = render(<Card className="custom-class">Content</Card>);
		expect(container.firstChild).toHaveClass("custom-class");
	});
});
