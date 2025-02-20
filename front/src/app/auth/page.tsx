"use client";

import { useLogin, useModalStatus } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useAccount } from "wagmi";

import { authBackground } from "@/components/auth/background";

export default function Auth() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const router = useRouter();
	const account = useAccount();

	const { login } = useLogin({ onComplete: () => handleBack });
	const { isOpen: isPrivyModalOpen } = useModalStatus();

	const handleBack = useCallback(() => {
		router.replace("/");
	}, [router]);

	useEffect(() => {
		if (!isPrivyModalOpen) {
			login();
		}
	}, [isPrivyModalOpen, login]);

	useEffect(() => {
		if (account.isConnected) {
			handleBack();
			return;
		}
		authBackground(canvasRef);
	}, [account, router, handleBack]);

	return (
		<div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-indigo-900">
			<canvas ref={canvasRef} className="absolute inset-0" style={{ mixBlendMode: "screen" }} />
		</div>
	);
}
