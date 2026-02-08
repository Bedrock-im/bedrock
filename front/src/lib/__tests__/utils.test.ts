import { cn } from "../utils";

describe("utils", () => {
	describe("cn", () => {
		it("should merge class names correctly", () => {
			expect(cn("foo", "bar")).toBe("foo bar");
		});

		it("should handle conditional classes", () => {
			expect(cn("foo", true && "bar", false && "baz")).toBe("foo bar");
		});

		it("should handle arrays of classes", () => {
			expect(cn(["foo", "bar"])).toBe("foo bar");
		});

		it("should handle objects of classes", () => {
			expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
		});

		it("should merge tailwind classes correctly", () => {
			expect(cn("p-4", "p-2")).toBe("p-2");
			expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
		});
	});
});
