"use client";

import { signMessage } from "@wagmi/core";
import { ReactNode } from "react";
import { useAccountEffect } from "wagmi";

import { wagmiConfig } from "@/config/wagmi";
import { AlephService, BEDROCK_MESSAGE } from "@/services/aleph";
import { useAccountStore } from "@/stores/account";

type WatchersProps = {
	children: ReactNode;
};

export function Watchers({ children }: WatchersProps) {
	const accountStore = useAccountStore();

	useAccountEffect({
		async onConnect() {
			// TODO: add some local storage persistance with user settings choice
			const hash = await signMessage(wagmiConfig, { message: BEDROCK_MESSAGE });
			const alephService = await AlephService.initialize(hash);
			if (alephService === undefined) {
				return;
			}

			accountStore.alephService = alephService;
		},
		onDisconnect() {
			accountStore.onDisconnect();
		},
	});

	return <>{children}</>;
}
