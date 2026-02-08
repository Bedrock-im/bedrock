import { normalizePath, joinPath, getParentPath, getFilename, getDestinationParent } from "../path";

describe("Path Utils", () => {
	describe("normalizePath", () => {
		it("should ensure path starts with /", () => {
			expect(normalizePath("foo")).toBe("/foo/");
		});

		it("should ensure path ends with /", () => {
			expect(normalizePath("/foo")).toBe("/foo/");
		});

		it("should remove multiple slashes", () => {
			expect(normalizePath("//foo///bar//")).toBe("/foo/bar/");
		});

		it("should return / for empty string", () => {
			expect(normalizePath("")).toBe("/");
		});
	});

	describe("joinPath", () => {
		it("should join directory and filename", () => {
			expect(joinPath("/foo", "bar.txt")).toBe("/foo/bar.txt");
		});

		it("should handle normalization of directory", () => {
			expect(joinPath("foo//", "bar.txt")).toBe("/foo/bar.txt");
		});
	});

	describe("getParentPath", () => {
		it("should return parent directory", () => {
			expect(getParentPath("/foo/bar/")).toBe("/foo/");
		});

		it("should return root for top-level path", () => {
			expect(getParentPath("/foo/")).toBe("/");
		});

		it("should return root for root path", () => {
			expect(getParentPath("/")).toBe("/");
		});
	});

	describe("getFilename", () => {
		it("should return the last part of the path", () => {
			expect(getFilename("/foo/bar")).toBe("bar");
		});

		it("should handle trailing slashes", () => {
			// Note: split('/').filter(Boolean) removes empty strings from trailing slashes
			expect(getFilename("/foo/bar/")).toBe("bar");
		});

		it("should return empty string for root", () => {
			expect(getFilename("/")).toBe("");
		});
	});

	describe("getDestinationParent", () => {
		it("should return parent path with trailing slash", () => {
			expect(getDestinationParent("/foo/bar")).toBe("/foo/");
		});

		it("should return root if no parent", () => {
			expect(getDestinationParent("/foo")).toBe("/");
		});
	});
});
