import { act, renderHook } from "@testing-library/react";

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
		matchMediaMock.mockImplementation(
			(query: string): MediaQueryList => ({
				matches: false,
				media: query,
				onchange: null,
				addEventListener: jest.fn(),
				removeEventListener: jest.fn(),
				dispatchEvent: jest.fn(),
				addListener: jest.fn(),
				removeListener: jest.fn(),
			}),
		);
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
	it("should update when window resize triggers change", () => {
		let changeHandler: () => void = () => {};

		matchMediaMock.mockImplementation((query) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: jest.fn(),
			removeListener: jest.fn(),
			addEventListener: jest.fn((event, handler) => {
				if (event === "change") {
					changeHandler = handler as unknown as () => void;
				}
			}),
			removeEventListener: jest.fn(),
			dispatchEvent: jest.fn(),
		}));

		// Start with desktop
		window.innerWidth = 1024;
		const { result } = renderHook(() => useIsMobile());
		expect(result.current).toBe(false);

		// Simulate resize to mobile and trigger change
		window.innerWidth = 500;
		// We need to manually trigger the event handler because JSDOM doesn't fire resize events on window.innerWidth change for matchMedia automatically in this mock setup
		// Actually, the hook listens to 'change' on mql.
		// In the mock above, we captured the handler.
		// We need to act() to trigger state update
		act(() => {
			changeHandler();
		});

		expect(result.current).toBe(true);
	});
});
