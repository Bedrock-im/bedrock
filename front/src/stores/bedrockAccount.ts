import { create } from "zustand";

import BedrockService from "@/services/bedrock";

type AccountStoreState = {
	bedrockService: BedrockService | null;
};

type AccountStoreActions = {
	onDisconnect: () => void;
};

export const useBedrockAccountStore = create<AccountStoreState & AccountStoreActions>((set) => ({
	bedrockService: null,

	onDisconnect: () => {
		set({ bedrockService: null });
	},
}));
