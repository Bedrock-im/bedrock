import { z } from "zod";

const envSchema = z.object({
	THIRDWEB_CLIENT_ID: z.string(),
	ALEPH_API_URL: z.string().url().optional(),
	ALEPH_GENERAL_CHANNEL: z.string().optional().default("bedrock"),
	USERNAMES_API_URL: z.string().url(),
	DEV_SAVE_LOCAL_SIGNATURE: z.string().optional().default("false"),
});

const env = envSchema.parse({
	THIRDWEB_CLIENT_ID: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
	ALEPH_API_URL: process.env.NEXT_PUBLIC_ALEPH_API_URL,
	ALEPH_GENERAL_CHANNEL: process.env.NEXT_PUBLIC_ALEPH_GENERAL_CHANNEL,
	USERNAMES_API_URL: process.env.NEXT_PUBLIC_USERNAMES_API_URL,
	DEV_SAVE_LOCAL_SIGNATURE: process.env.NEXT_PUBLIC_DEV_SAVE_LOCAL_SIGNATURE,
});

export default env;
