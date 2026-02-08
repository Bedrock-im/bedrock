import { render, screen } from "@testing-library/react";
import React from "react";

// Mock dependencies before imports
const mockUseRequireAuth = jest.fn(() => ({ isConnected: false }));
jest.mock("@/hooks/use-auth", () => ({
	useRequireAuth: () => mockUseRequireAuth(),
}));

const mockUseAccountStore = jest.fn(() => ({ username: null as string | null, bedrockClient: null as object | null }));
jest.mock("@/stores/account", () => ({
	useAccountStore: () => mockUseAccountStore(),
}));

const mockUseActiveAccount = jest.fn(() => undefined as object | undefined);
jest.mock("thirdweb/react", () => ({
	useActiveAccount: () => mockUseActiveAccount(),
}));

jest.mock("next/navigation", () => ({
	useRouter: jest.fn(),
}));

// Mock component dependencies
jest.mock("@/components/UsernameRegistrationModal", () => ({
	UsernameRegistrationModal: () => <div data-testid="registration-modal">Registration Modal</div>,
}));

// Import component after mocks
import { AuthWrapper } from "@/components/AuthWrapper";

describe("AuthWrapper", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders loader when not connected", () => {
		// Setup mock return values
		mockUseRequireAuth.mockReturnValue({ isConnected: false });
		mockUseAccountStore.mockReturnValue({ username: null, bedrockClient: null });
		mockUseActiveAccount.mockReturnValue(undefined);

		render(
			<AuthWrapper>
				<div data-testid="child-content">Child Content</div>
			</AuthWrapper>,
		);

		expect(screen.queryByTestId("child-content")).toBeNull();
	});

	it("renders children when connected and username exists", () => {
		// Setup mock return values
		mockUseRequireAuth.mockReturnValue({ isConnected: true });

		mockUseAccountStore.mockReturnValue({ username: "testuser", bedrockClient: {} });

		mockUseActiveAccount.mockReturnValue({ address: "0x123" });

		render(
			<AuthWrapper>
				<div data-testid="child-content">Child Content</div>
			</AuthWrapper>,
		);

		expect(screen.getByTestId("child-content")).toBeInTheDocument();
		expect(screen.queryByTestId("registration-modal")).toBeNull();
	});

	it("renders registration modal when connected but no username", () => {
		mockUseRequireAuth.mockReturnValue({ isConnected: true });

		mockUseAccountStore.mockReturnValue({
			username: null,
			bedrockClient: {},
		});

		mockUseActiveAccount.mockReturnValue({ address: "0x123" });

		render(
			<AuthWrapper>
				<div data-testid="child-content">Child Content</div>
			</AuthWrapper>,
		);

		// Expect registration modal to be visible
		expect(screen.getByTestId("registration-modal")).toBeInTheDocument();
		// Child content should NOT be visible because {username && children} checks for username
		expect(screen.queryByTestId("child-content")).toBeNull();
	});
});
