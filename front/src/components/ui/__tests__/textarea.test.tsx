import { render, screen, fireEvent } from "@testing-library/react";

import { Textarea } from "../textarea";

describe("Textarea Component", () => {
	it("renders correctly", () => {
		render(<Textarea placeholder="Enter description" />);
		const textarea = screen.getByPlaceholderText("Enter description");
		expect(textarea).toBeInTheDocument();
	});

	it("handles change events", () => {
		const handleChange = jest.fn();
		render(<Textarea onChange={handleChange} placeholder="Type here" />);
		const textarea = screen.getByPlaceholderText("Type here");

		fireEvent.change(textarea, { target: { value: "test content" } });
		expect(handleChange).toHaveBeenCalledTimes(1);
	});

	it("can be disabled", () => {
		render(<Textarea disabled placeholder="Disabled" />);
		const textarea = screen.getByPlaceholderText("Disabled");
		expect(textarea).toBeDisabled();
	});

	it("applies custom className", () => {
		render(<Textarea className="h-32" placeholder="Tall textarea" />);
		const textarea = screen.getByPlaceholderText("Tall textarea");
		expect(textarea).toHaveClass("h-32");
	});
});
