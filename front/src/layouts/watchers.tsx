"use client";

import { ReactNode } from "react";
import { useAccountEffect } from "wagmi";

import { useAccountStore } from "@/stores/account";

type WatchersProps = {
	children: ReactNode;
};

export function Watchers({ children }: WatchersProps) {
	const accountStore = useAccountStore();

	useAccountEffect({
		onConnect(data) {
			console.log("Connected!", data);
		},
		onDisconnect() {
			console.log("Disconnected!");
		},
	});

	return <>{children}</>;
}
