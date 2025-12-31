import { BEDROCK_MESSAGE, BedrockClient } from "bedrock-ts-sdk";
import { Account, Wallet } from "thirdweb/wallets";
import { create } from "zustand";

import { getAvatarUsernameUsernameAvatarGet, getUsernameAddressGet } from "@/apis/usernames";
import env from "@/config/env";
import { LibertaiService } from "@/services/libertai";

type AccountStoreState = {
	isConnected: boolean;
	bedrockClient: BedrockClient | null;
	libertaiService: LibertaiService | null;
	username: string | null;
	avatarUrl: string | null;
};

type AccountStoreActions = {
	onDisconnect: () => void;
	onAccountChange: (account: Account | undefined, wallet: Wallet | undefined) => Promise<void>;
	setUsername: (username: string) => void;
	fetchAvatar: (username: string) => Promise<void>;
};

export const useAccountStore = create<AccountStoreState & AccountStoreActions>((set, get) => ({
	isConnected: false,
	bedrockClient: null,
	libertaiService: null,
	username: null,
	avatarUrl: null,
	onAccountChange: async (account, wallet) => {
		const state = get();

		if (account === undefined || wallet === undefined) {
			// Potential disconnection
			state.onDisconnect();
			return;
		}

		let hash: `0x${string}` = "0x";

		const localSignatureKey = `bedrock-signature-${account.address}`;

		if (env.DEV_SAVE_LOCAL_SIGNATURE === "true") {
			// Try loading from localStorage
			const storedSig = localStorage.getItem(localSignatureKey) as `0x${string}` | null;
			if (storedSig) {
				hash = storedSig;
			} else {
				// Sign and store
				hash = await account.signMessage({ message: BEDROCK_MESSAGE });
				localStorage.setItem(localSignatureKey, hash);
			}
		} else {
			// Always ask for signature, don't store
			hash = await account.signMessage({ message: BEDROCK_MESSAGE });
		}

		// Check if user has a username before setting isConnected
		try {
			const result = await getUsernameAddressGet({
				path: { address: account.address },
			});
			const username = result.data?.username;

			const libertaiService = new LibertaiService();
			const bedrockClient = await BedrockClient.fromSignature(hash, wallet, {
				apiServer: env.ALEPH_API_URL,
				channel: env.ALEPH_GENERAL_CHANNEL,
			});

			// Only mark as connected if a username exists
			set({
				bedrockClient,
				libertaiService,
				username: username || null,
				isConnected: Boolean(username), // Only true if username exists
			});

			// Fetch avatar if username exists
			if (username) {
				get().fetchAvatar(username);
			}
		} catch (error) {
			console.error("Error fetching username:", error);
			set({ isConnected: false });
		}
	},
	onDisconnect: () => {
		set({
			bedrockClient: null,
			isConnected: false,
			username: null,
			avatarUrl: null,
		});
	},
	setUsername: (username) => {
		const state = get();
		if (state.bedrockClient) {
			set({ username, isConnected: true });
			// Fetch avatar when username is set
			state.fetchAvatar(username);
		}
	},
	fetchAvatar: async (username) => {
		try {
			const response = await getAvatarUsernameUsernameAvatarGet({
				path: { username },
			});

			if (response.data) {
				set({ avatarUrl: response.data });
			}
		} catch (error) {
			console.error("Failed to fetch avatar:", error);
			set({ avatarUrl: null });
		}
	},
}));
