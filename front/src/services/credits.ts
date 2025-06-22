import { z } from "zod";

import { AlephService } from "@/services/aleph";

const CREDITS_AGGREGATE_KEY = "credits";
// Backend address that manages the credits aggregate
const BACKEND_ADDRESS = "0x1234567890123456789012345678901234567890"; // TODO: Replace with actual backend address

export const UserCreditSchema = z.object({
	balance: z.number().default(0),
	transactions: z
		.array(
			z.object({
				id: z.string(),
				amount: z.number(),
				type: z.enum(["top_up", "deduct"]),
				timestamp: z.number(),
				description: z.string(),
				txHash: z.string().optional(),
			}),
		)
		.default([]),
});

export const CreditAggregateSchema = z.record(z.string(), UserCreditSchema);

export type UserCredit = z.infer<typeof UserCreditSchema>;

export class CreditService {
	constructor(
		private alephService: AlephService,
		private userAddress: string,
	) {}

	async getCreditBalance(): Promise<UserCredit> {
		try {
			const creditAggregate = await this.alephService.fetchAggregate(
				CREDITS_AGGREGATE_KEY,
				CreditAggregateSchema,
				BACKEND_ADDRESS,
			);

			return creditAggregate[this.userAddress] || { balance: 0, transactions: [] };
		} catch {
			// If aggregate doesn't exist or user not found, return default
			return { balance: 0, transactions: [] };
		}
	}
}
