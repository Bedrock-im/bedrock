import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { mainnet } from "wagmi/chains";

export const config = createConfig({
	chains: [mainnet],
	transports: {
		[mainnet.id]: http(),
	},
	ssr: true,
	storage: createStorage({
		storage: cookieStorage,
	}),
});
