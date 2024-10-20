import type { PrivyClientConfig } from "@privy-io/react-auth";

export const privyConfig: PrivyClientConfig = {
	embeddedWallets: {
		createOnLogin: "users-without-wallets",
	},
	loginMethods: ["wallet", "email"],
	appearance: {
		showWalletLoginFirst: true,
		walletList: ["detected_ethereum_wallets", "wallet_connect"],
		walletChainType: "ethereum-only",
	},
};
