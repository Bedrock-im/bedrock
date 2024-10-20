import { z } from "zod";

const envSchema = z.object({
	PRIVY_APP_ID: z.string(),
});

const env = envSchema.parse({ PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID });

export default env;
