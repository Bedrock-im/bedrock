import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// Global settings
const ALGORITHM = "aes-256-cbc";
const INPUT_ENCODING = "utf8";
const OUTPUT_ENCODING = "hex";
export const BUFFER_ENCODING: BufferEncoding = "hex";

export class EncryptionService {
	static encrypt(data: string, key: Buffer, iv: Buffer): string {
		const cipher = createCipheriv(ALGORITHM, key, iv);
		let encrypted = cipher.update(data, INPUT_ENCODING, OUTPUT_ENCODING);
		encrypted += cipher.final(OUTPUT_ENCODING);
		return encrypted;
	}

	static decrypt(encryptedText: string, key: Buffer, iv: Buffer): string {
		const decipher = createDecipheriv(ALGORITHM, key, iv);
		let decrypted = decipher.update(encryptedText, OUTPUT_ENCODING, INPUT_ENCODING);
		decrypted += decipher.final(INPUT_ENCODING);
		return decrypted;
	}

	static async encryptFile(file: File, key: Buffer, iv: Buffer): Promise<Buffer> {
		const arrayBuffer = await file.arrayBuffer();
		const bufferString = Buffer.from(arrayBuffer).toString("hex");
		const encryptedString = EncryptionService.encrypt(bufferString, key, iv);
		return Buffer.from(encryptedString);
	}

	static decryptFile(arrayBuffer: ArrayBuffer, key: Buffer, iv: Buffer): Buffer {
		const fileBufferString = Buffer.from(arrayBuffer).toString();
		const decryptedString = EncryptionService.decrypt(fileBufferString, key, iv);
		return Buffer.from(decryptedString, BUFFER_ENCODING);
	}

	static generateKey(): Buffer {
		return Buffer.from(randomBytes(16).toString(BUFFER_ENCODING));
	}

	static generateIv(): Buffer {
		return Buffer.from(randomBytes(8).toString(BUFFER_ENCODING));
	}
}
