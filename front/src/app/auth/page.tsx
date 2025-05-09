"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { ConnectEmbed, useActiveAccount, useActiveWallet } from "thirdweb/react";

import { authBackground } from "@/components/auth/background";
import { thirdwebClient } from "@/config/thirdweb";
import { useAccountStore } from "@/stores/account";

export default function Auth() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const router = useRouter();
	const account = useActiveAccount();
	const wallet = useActiveWallet();
	const isConnected = useAccountStore((state) => state.isConnected);

	const handleBack = useCallback(() => {
		router.replace("/");
	}, [router]);

	useEffect(() => {
		if (account !== undefined && wallet !== undefined && isConnected) {
			handleBack();
			return;
		}
		authBackground(canvasRef);
	}, [account, wallet, isConnected, handleBack]);

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900">
			<canvas ref={canvasRef} className="absolute inset-0" style={{ mixBlendMode: "screen" }} />
			<ConnectEmbed client={thirdwebClient} />
		</div>
	);
}
