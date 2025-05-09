"use client";
import { ReactNode, useEffect } from "react";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";

import { useAccountStore } from "@/stores/account";

type WatchersProps = {
	children: ReactNode;
};

export function Watchers({ children }: WatchersProps) {
	const account = useActiveAccount();
	const wallet = useActiveWallet();
	const onAccountChange = useAccountStore((state) => state.onAccountChange);

	useEffect(() => {
		onAccountChange(account).then();
	}, [account, onAccountChange]);

	wallet?.subscribe("accountChanged", (account) => {
		onAccountChange(account).then();
	});

	return <>{children}</>;
}
