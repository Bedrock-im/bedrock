import { render, screen } from "@testing-library/react";
import React from "react";

import { Slider } from "../slider";

// Mock ResizeObserver if not already global
if (!global.ResizeObserver) {
	global.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}

describe("Slider", () => {
	it("renders slider and handles value", () => {
		render(<Slider defaultValue={[50]} max={100} step={1} />);

		const slider = screen.getByRole("slider");
		expect(slider).toBeInTheDocument();
		// Radix slider usually has aria-valuenow
		expect(slider).toHaveAttribute("aria-valuenow", "50");
	});
});
