import { render, screen, fireEvent } from "@testing-library/react";

import { Checkbox } from "../checkbox";

describe("Checkbox Component", () => {
	it("renders correctly", () => {
		render(<Checkbox aria-label="Accept terms" />);
		const checkbox = screen.getByRole("checkbox", { name: /accept terms/i });
		expect(checkbox).toBeInTheDocument();
	});

	it("can be checked", () => {
		render(<Checkbox aria-label="Accept terms" />);
		const checkbox = screen.getByRole("checkbox", { name: /accept terms/i });

		expect(checkbox).toHaveAttribute("data-state", "unchecked");
		fireEvent.click(checkbox);
		expect(checkbox).toHaveAttribute("data-state", "checked");
	});

	it("can be disabled", () => {
		render(<Checkbox aria-label="Accept terms" disabled />);
		const checkbox = screen.getByRole("checkbox", { name: /accept terms/i });
		expect(checkbox).toBeDisabled();
	});

	it("respects defaultChecked", () => {
		render(<Checkbox aria-label="Accept terms" defaultChecked />);
		const checkbox = screen.getByRole("checkbox", { name: /accept terms/i });
		expect(checkbox).toHaveAttribute("data-state", "checked");
	});
});
