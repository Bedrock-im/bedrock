import { render, screen, fireEvent } from "@testing-library/react";

import { useThemeStore } from "@/stores/theme";

import { ThemeToggle } from "../ThemeToggle";

// Mock the store
jest.mock("@/stores/theme", () => ({
	useThemeStore: jest.fn(),
}));

// Mock Lucide icons
jest.mock("lucide-react", () => ({
	Sun: () => <div data-testid="icon-sun">Sun</div>,
	Moon: () => <div data-testid="icon-moon">Moon</div>,
	Monitor: () => <div data-testid="icon-monitor">Monitor</div>,
}));

describe("ThemeToggle Component", () => {
	const mockSetMode = jest.fn();

	beforeEach(() => {
		(useThemeStore as unknown as jest.Mock).mockReturnValue({
			mode: "light",
			setMode: mockSetMode,
		});
		mockSetMode.mockClear();
	});

	it("renders all theme options", () => {
		render(<ThemeToggle />);
		expect(screen.getByText("Light")).toBeInTheDocument();
		expect(screen.getByText("Dark")).toBeInTheDocument();
		expect(screen.getByText("System")).toBeInTheDocument();
	});

	it("highlights the current theme", () => {
		render(<ThemeToggle />);
		// Assuming the visual indication involves checking styles or classes
		// but RTL recommends testing behavior.
		// We can check if the radio item is checked if it was a real radio input.
		// The component uses Radix RadioGroup.

		// Since Radix RadioGroup renders inputs with role="radio", we can check aria-checked.
		// The label text includes the icon text (mocked) and the span text, so exact match might fail.
		// We use getByRole with name option which computes accessible name.
		const lightOption = screen.getByRole("radio", { name: /Light/i });
		expect(lightOption).toHaveAttribute("aria-checked", "true");
	});

	it("calls setMode when a theme is selected", () => {
		render(<ThemeToggle />);
		const darkOptionLabel = screen.getByText("Dark");

		fireEvent.click(darkOptionLabel);

		// The click might trigger the radio group change.
		// Depending on how Radix UI handles clicks on labels, this should work.
		// We might need to click the actual radio item if labels aren't perfectly wired in jsdom setup,
		// but usually Radix works well.
		expect(mockSetMode).toHaveBeenCalledWith("dark");
	});
});
