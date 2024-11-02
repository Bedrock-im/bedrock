import { z } from "zod";

const envSchema = z.object({
	PRIVY_APP_ID: z.string(),
	ALEPH_API_URL: z.string().url().optional(),
});

const env = envSchema.parse({
	PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
	ALEPH_API_URL: process.env.NEXT_PUBLIC_ALEPH_API_URL,
});

export default env;
