import { renderHook } from "@testing-library/react";

import { useIsMobile } from "../use-is-mobile";

describe("useIsMobile Hook", () => {
	let matchMediaMock: jest.Mock;

	beforeAll(() => {
		matchMediaMock = jest.fn();
		Object.defineProperty(window, "matchMedia", {
			writable: true,
			value: matchMediaMock,
		});

		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 1024,
		});
	});

	beforeEach(() => {
		matchMediaMock.mockImplementation((query: string): MediaQueryList => ({
			matches: false,
			media: query,
			onchange: null,
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
			dispatchEvent: jest.fn(),
		}));
	});

	it("should return false for desktop width", () => {
		window.innerWidth = 1024;
		const { result } = renderHook(() => useIsMobile());
		expect(result.current).toBe(false);
	});

	it("should return true for mobile width", () => {
		window.innerWidth = 500;
		const { result } = renderHook(() => useIsMobile());
		expect(result.current).toBe(true);
	});
});
