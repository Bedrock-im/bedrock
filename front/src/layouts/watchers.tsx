"use client";

import { signMessage } from "@wagmi/core";
import { ReactNode, useCallback, useEffect } from "react";
import { useAccount, useAccountEffect } from "wagmi";

import { wagmiConfig } from "@/config/wagmi";
import { AlephService, BEDROCK_MESSAGE } from "@/services/aleph";
import BedrockService from "@/services/bedrock";
import { useAccountStore } from "@/stores/account";

type WatchersProps = {
	children: ReactNode;
};

export function Watchers({ children }: WatchersProps) {
	const account = useAccount();
	const accountStore = useAccountStore();

	const initAccount = useCallback(async () => {
		const hash = await signMessage(wagmiConfig, { message: BEDROCK_MESSAGE });
		const alephService = await AlephService.initialize(hash);
		if (alephService === undefined) {
			return;
		}

		const bedrockService = new BedrockService(alephService);
		await bedrockService.setup();

		accountStore.connect(bedrockService);
	}, [accountStore]);

	useEffect(() => {
		if (account.isConnected && !accountStore.bedrockService) {
			initAccount();
		}
	}, [account, accountStore, initAccount]);

	useAccountEffect({
		async onConnect() {
			// TODO: add some local storage persistance with user settings choice
			await initAccount();
		},
		onDisconnect() {
			accountStore.onDisconnect();
		},
	});

	return <>{children}</>;
}
