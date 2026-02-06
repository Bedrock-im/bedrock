import { render, screen } from "@testing-library/react";

import { Progress } from "../progress";

describe("Progress Component", () => {
	it("renders correctly", () => {
		render(<Progress value={50} data-testid="progress" />);
		const progress = screen.getByTestId("progress");
		expect(progress).toBeInTheDocument();
	});

	it("has progressbar role", () => {
		render(<Progress value={50} />);
		const progress = screen.getByRole("progressbar");
		expect(progress).toBeInTheDocument();
	});

	it("renders with different values", () => {
		const { rerender } = render(<Progress value={0} data-testid="progress" />);
		expect(screen.getByTestId("progress")).toBeInTheDocument();

		rerender(<Progress value={50} data-testid="progress" />);
		expect(screen.getByTestId("progress")).toBeInTheDocument();

		rerender(<Progress value={100} data-testid="progress" />);
		expect(screen.getByTestId("progress")).toBeInTheDocument();
	});

	it("applies custom className", () => {
		render(<Progress value={50} className="h-4" data-testid="progress" />);
		const progress = screen.getByTestId("progress");
		expect(progress).toHaveClass("h-4");
	});
});
