import { create } from "zustand";

import { AlephService } from "@/services/aleph";

type AccountStoreState = {
	alephService: AlephService | null;
};

export const useAccountStore = create<AccountStoreState>((set) => ({
	alephService: null,
}));
