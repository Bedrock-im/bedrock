import { create } from "zustand";

import { AlephService } from "@/services/aleph";

type AccountStoreState = {
	alephService: AlephService | null;
};

type AccountStoreActions = {
	onDisconnect: () => void;
};

export const useAccountStore = create<AccountStoreState & AccountStoreActions>((set) => ({
	alephService: null,

	onDisconnect: () => {
		set({ alephService: null });
	},
}));
