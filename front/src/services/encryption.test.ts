import { describe, expect, test } from "@jest/globals";

import { EncryptionService } from "@/services/encryption";

describe("Encryption", () => {
	test("encrypt and decrypt string", () => {
		const message = "test-encryption";
		const key = EncryptionService.generateKey();
		const iv = EncryptionService.generateIv();

		const encryptedMessage = EncryptionService.encrypt(message, key, iv);
		const decryptedMessage = EncryptionService.decrypt(encryptedMessage, key, iv);

		expect(encryptedMessage).not.toBe(message);
		expect(message).toBe(decryptedMessage);
	});
});
