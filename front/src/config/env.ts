import { z } from "zod";

const envSchema = z.object({
	PRIVY_APP_ID: z.string(),
	ALEPH_API_URL: z.string().url().optional(),
	ALEPH_GENERAL_CHANNEL: z.string().optional().default("bedrock"),
});

const env = envSchema.parse({
	PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
	ALEPH_API_URL: process.env.NEXT_PUBLIC_ALEPH_API_URL,
	ALEPH_GENERAL_CHANNEL: process.env.NEXT_PUBLIC_ALEPH_GENERAL_CHANNEL,
});

export default env;
