import { render, screen, fireEvent } from "@testing-library/react";

import { Button } from "../button";

describe("Button Component", () => {
	it("renders correctly", () => {
		render(<Button>Click me</Button>);
		const button = screen.getByRole("button", { name: /click me/i });
		expect(button).toBeInTheDocument();
	});

	it("passes standard HTML attributes", () => {
		render(<Button disabled>Disabled</Button>);
		const button = screen.getByRole("button", { name: /disabled/i });
		expect(button).toBeDisabled();
	});

	it("handles onClick events", () => {
		const handleClick = jest.fn();
		render(<Button onClick={handleClick}>Click me</Button>);
		const button = screen.getByRole("button", { name: /click me/i });

		fireEvent.click(button);
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("applies variant classes", () => {
		const { container } = render(<Button variant="destructive">Delete</Button>);
		const button = screen.getByRole("button", { name: /delete/i });
		expect(button).toHaveClass("bg-destructive");
	});
});
