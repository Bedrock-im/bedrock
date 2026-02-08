import { render, screen, waitFor } from "@testing-library/react";
import { FileService, PublicFileMeta } from "bedrock-ts-sdk";
import React from "react";

import Public from "@/app/public/[id]/page";

// Mock dependencies
jest.mock("bedrock-ts-sdk", () => {
	return {
		FileService: {
			fetchPublicFileMeta: jest.fn(),
			downloadPublicFile: jest.fn(),
		},
		BedrockClient: class {},
	};
});

// Mock canvas logic to avoid errors in test environment
jest.mock("@/components/auth/background", () => ({
	dotsBackground: jest.fn(),
}));

// Mock HTMLCanvasElement.getContext to prevent errors during render
HTMLCanvasElement.prototype.getContext = jest.fn();

// Mock HTMLAnchorElement.click to prevent jsdom navigation error
HTMLAnchorElement.prototype.click = jest.fn();

describe("Public Page", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("displays invalid link message for random/invalid ID", async () => {
		// Mock fetchPublicFileMeta to return null (invalid)
		(FileService.fetchPublicFileMeta as jest.Mock).mockResolvedValue(null);

		render(<Public params={{ id: "random-invalid-id" }} />);

		// Wait for loading to finish
		await waitFor(() => {
			expect(screen.queryByText(/Your file is loading/i)).not.toBeInTheDocument();
		});

		expect(screen.getByText("Sorry, you entered an invalid link.")).toBeInTheDocument();
	});

	it("displays file info for working ID 01cad782c0e530df1fcc812ba375b28f0d1ceefd53879c4664040c9c977ff3e2", async () => {
		const validFile: PublicFileMeta = {
			name: "test-file.txt",
			username: "testuser",
			size: 1024,
			store_hash: "hash123",
			created_at: new Date().toISOString(),
		} as unknown as PublicFileMeta;

		(FileService.fetchPublicFileMeta as jest.Mock).mockResolvedValue(validFile);

		const workingId = "01cad782c0e530df1fcc812ba375b28f0d1ceefd53879c4664040c9c977ff3e2";
		render(<Public params={{ id: workingId }} />);

		await waitFor(() => {
			expect(screen.queryByText(/Your file is loading/i)).not.toBeInTheDocument();
		});

		// Check for "shared a file with you" text
		await waitFor(() => {
			expect(screen.getByText(/shared a file with you/i)).toBeInTheDocument();
		});

		expect(screen.getByText("testuser")).toBeInTheDocument();
		expect(screen.getByText("test-file.txt")).toBeInTheDocument();
		// Check for download button
		expect(screen.getByText("Download")).toBeInTheDocument();
	});

	it("handles download click", async () => {
		const validFile: PublicFileMeta = {
			name: "test-file.txt",
			username: "testuser",
			size: 1024,
			store_hash: "hash123",
			created_at: new Date().toISOString(),
		} as unknown as PublicFileMeta;

		(FileService.fetchPublicFileMeta as jest.Mock).mockResolvedValue(validFile);
		(FileService.downloadPublicFile as jest.Mock).mockResolvedValue(new ArrayBuffer(8)); // Mock buffer

		// Mock URL.createObjectURL and HTMLAnchorElement click
		global.URL.createObjectURL = jest.fn(() => "blob:url");

		// Mock createElement/appendChild/removeChild for link download
		// We can spy on document.createElement or just assume the component logic works if we click it.
		// But the component uses a hidden link. Let's mock the document body append/remove interaction if possible,
		// or just verify FileService.downloadPublicFile is called.

		render(<Public params={{ id: "valid-id" }} />);

		await waitFor(() => {
			expect(screen.getByText("Download")).toBeInTheDocument();
		});

		const downloadButton = screen.getByText("Download");
		downloadButton.click();

		await waitFor(() => {
			expect(FileService.downloadPublicFile).toHaveBeenCalledWith("hash123");
		});
	});
});
