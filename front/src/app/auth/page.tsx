"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConnectEmbed, useActiveAccount, useActiveWallet } from "thirdweb/react";

import { authBackground } from "@/components/auth/background";
import { UsernameRegistrationModal } from "@/components/UsernameRegistrationModal";
import { thirdwebClient } from "@/config/thirdweb";
import { useAccountStore } from "@/stores/account";

export default function Auth() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const router = useRouter();
	const account = useActiveAccount();
	const wallet = useActiveWallet();
	const { isConnected, username, bedrockService } = useAccountStore();
	const [showRegistrationModal, setShowRegistrationModal] = useState(false);

	const handleBack = useCallback(() => {
		router.replace("/");
	}, [router]);

	useEffect(() => {
		if (account !== undefined && wallet !== undefined) {
			// User connected but no username registered yet
			if (bedrockService && !isConnected && !username) {
				setShowRegistrationModal(true);
				return;
			}

			// User is fully connected (has wallet + username)
			if (isConnected) {
				handleBack();
				return;
			}
		}

		// Just setup the background on initial load
		authBackground(canvasRef);
	}, [account, wallet, isConnected, handleBack, username, bedrockService]);

	const handleUsernameComplete = () => {
		setShowRegistrationModal(false);
		// Will redirect automatically when isConnected becomes true
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900">
			<canvas ref={canvasRef} className="absolute inset-0" style={{ mixBlendMode: "screen" }} />
			<ConnectEmbed client={thirdwebClient} />

			{showRegistrationModal && account && (
				<UsernameRegistrationModal isOpen={showRegistrationModal} onComplete={handleUsernameComplete} />
			)}
		</div>
	);
}
