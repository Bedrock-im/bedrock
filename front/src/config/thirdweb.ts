import { createThirdwebClient } from "thirdweb";

import env from "@/config/env";

export const thirdwebClient = createThirdwebClient({
	clientId: env.THIRDWEB_CLIENT_ID,
});
