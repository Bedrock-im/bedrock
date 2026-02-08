import { shrinkEthAddress } from "../ethereum";

describe("shrinkEthAddress", () => {
	it("should shrink a valid ethereum address", () => {
		const address = "0x1234567890abcdef1234567890abcdef12345678";
		const shrunk = shrinkEthAddress(address);
		expect(shrunk).toBe("0x1234...5678");
	});

	it("should handle strings shorter than typical addresses but long enough to slice", () => {
		const address = "0x1234567890";
		// 0x1234 (first 6) ... 7890 (last 4)
		// Wait, slice(0, 6) is '0x1234' (length 6)
		// slice(-4) is '7890'
		// So '0x1234...7890'
		const shrunk = shrinkEthAddress(address);
		expect(shrunk).toBe("0x1234...7890");
	});
});
