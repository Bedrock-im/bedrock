import { create } from "zustand";

import BedrockService from "@/services/bedrock";

type AccountStoreState = {
	bedrockService: BedrockService | null;
};

type AccountStoreActions = {
	onDisconnect: () => void;
	connect: (bedrockService: BedrockService) => void;
};

export const useBedrockAccountStore = create<AccountStoreState & AccountStoreActions>((set) => ({
	bedrockService: null,
	connect(bedrockService: BedrockService) {
		set({ bedrockService });
	},
	onDisconnect: () => {
		set({ bedrockService: null });
	},
}));
