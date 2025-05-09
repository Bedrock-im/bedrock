import { Account } from "thirdweb/wallets";
import { create } from "zustand";

import { AlephService, BEDROCK_MESSAGE } from "@/services/aleph";
import BedrockService from "@/services/bedrock";

type AccountStoreState = {
	isConnected: boolean;
	bedrockService: BedrockService | null;
};

type AccountStoreActions = {
	onDisconnect: () => void;
	onAccountChange: (account: Account | undefined) => Promise<void>;
};

export const useAccountStore = create<AccountStoreState & AccountStoreActions>((set, get) => ({
	isConnected: false,
	bedrockService: null,
	onAccountChange: async (account) => {
		const state = get();

		if (account === undefined) {
			// Potential disconnection
			state.onDisconnect();
			return;
		}

		const hash = await account.signMessage({ message: BEDROCK_MESSAGE });
		const alephService = await AlephService.initialize(hash);
		if (alephService === undefined) {
			return;
		}

		const bedrockService = new BedrockService(alephService);
		await bedrockService.setup();
		set({ bedrockService, isConnected: true });
	},
	onDisconnect: () => {
		set({ bedrockService: null, isConnected: false });
	},
}));
