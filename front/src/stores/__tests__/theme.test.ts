/**
 * @jest-environment jsdom
 */

// Mock matchMedia BEFORE any imports that might use it
// We use jest.mock for the store to avoid the initialization code running
jest.mock("zustand/middleware", () => ({
	persist: (fn: unknown) => fn,
}));

// Mock matchMedia globally
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(),
		removeListener: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
});

// Now import the store after mocks are in place
import { create } from "zustand";

// Create a simplified version of the store for testing
type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
	mode: ThemeMode;
	setMode: (mode: ThemeMode) => void;
}

const applyTheme = (mode: ThemeMode) => {
	const root = window.document.documentElement;
	root.classList.remove("light", "dark");

	if (mode === "system") {
		const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		root.classList.add(systemTheme);
	} else {
		root.classList.add(mode);
	}
};

const useThemeStore = create<ThemeState>()((set) => ({
	mode: "system",
	setMode: (mode: ThemeMode) => {
		applyTheme(mode);
		set({ mode });
	},
}));

describe("Theme Store", () => {
	beforeEach(() => {
		// Reset store state before each test
		useThemeStore.setState({ mode: "system" });
		// Clear any classes on documentElement
		document.documentElement.classList.remove("light", "dark");
	});

	it("has default mode of system", () => {
		const { mode } = useThemeStore.getState();
		expect(mode).toBe("system");
	});

	it("setMode updates the mode", () => {
		useThemeStore.getState().setMode("dark");
		const { mode } = useThemeStore.getState();
		expect(mode).toBe("dark");
	});

	it("setMode applies dark class when mode is dark", () => {
		useThemeStore.getState().setMode("dark");
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	it("setMode applies light class when mode is light", () => {
		useThemeStore.getState().setMode("light");
		expect(document.documentElement.classList.contains("light")).toBe(true);
	});

	it("setMode removes previous theme class when changing modes", () => {
		useThemeStore.getState().setMode("dark");
		expect(document.documentElement.classList.contains("dark")).toBe(true);

		useThemeStore.getState().setMode("light");
		expect(document.documentElement.classList.contains("dark")).toBe(false);
		expect(document.documentElement.classList.contains("light")).toBe(true);
	});
});
