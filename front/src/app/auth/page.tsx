"use client";

import { HardDrive, Lock, Shield } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConnectEmbed, useActiveAccount, useActiveWallet } from "thirdweb/react";

import { dotsBackground } from "@/components/auth/background";
import { UsernameRegistrationModal } from "@/components/UsernameRegistrationModal";
import { thirdwebClient } from "@/config/thirdweb";
import { useAccountStore } from "@/stores/account";

export const dynamic = "force-dynamic";

const features = [
	{
		icon: Shield,
		title: "End-to-End Encrypted",
		description: "Your files are encrypted before leaving your device",
	},
	{
		icon: Lock,
		title: "You Own Your Data",
		description: "No central authority nor administrator can access your files",
	},
	{
		icon: HardDrive,
		title: "Decentralized Storage",
		description: "Files stored across Aleph, a decentralized distributed network",
	},
];

export default function Auth() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const router = useRouter();
	const account = useActiveAccount();
	const wallet = useActiveWallet();
	const { isConnected, username, bedrockClient } = useAccountStore();
	const [showRegistrationModal, setShowRegistrationModal] = useState(false);

	const handleBack = useCallback(() => {
		router.replace("/");
	}, [router]);

	useEffect(() => {
		if (account !== undefined && wallet !== undefined) {
			if (bedrockClient && !isConnected && !username) {
				setShowRegistrationModal(true);
				return;
			}

			if (isConnected) {
				handleBack();
				return;
			}
		}

		dotsBackground(canvasRef);
	}, [account, wallet, isConnected, handleBack, username, bedrockClient]);

	const handleUsernameComplete = () => {
		setShowRegistrationModal(false);
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-violet-900 overflow-hidden">
			<canvas ref={canvasRef} className="absolute inset-0 opacity-40" style={{ mixBlendMode: "screen" }} />

			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />

			<div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
				<div className="flex-1 text-center lg:text-left animate-slide-up">
					<div className="inline-flex items-center gap-3 mb-6">
						<div className="flex items-center justify-center size-14 rounded-2xl">
							<Image src="/logo.png" alt="Bedrock Logo" width={80} height={80} />
						</div>
						<span className="text-3xl font-bold text-white tracking-tight">Bedrock</span>
					</div>

					<h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
						Your Private Workspace,
						<br />
						<span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
							By Design
						</span>
					</h1>

					<p className="text-lg text-purple-100/80 mb-10 max-w-md mx-auto lg:mx-0">
						Decentralized file storage that puts you in control. No compromises on privacy.
					</p>

					<div className="space-y-4">
						{features.map((feature, index) => (
							<div
								key={feature.title}
								className="flex items-start gap-4 p-4 rounded-xl glass-dark text-left transition-all duration-300 hover:bg-white/10"
								style={{ animationDelay: `${index * 100}ms` }}
							>
								<div className="flex items-center justify-center size-10 rounded-lg bg-purple-500/20 shrink-0">
									<feature.icon className="size-5 text-purple-400" />
								</div>
								<div>
									<h3 className="font-semibold text-white text-sm">{feature.title}</h3>
									<p className="text-purple-200/70 text-sm">{feature.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="w-full max-w-md animate-scale-in">
					<div className="glass-dark rounded-3xl p-2 shadow-2xl">
						<ConnectEmbed
							client={thirdwebClient}
							style={{
								borderRadius: "1.25rem",
								border: "none",
								boxShadow: "none",
							}}
						/>
					</div>
					<p className="text-center text-purple-200/60 text-sm mt-6">Connect your wallet to get started</p>
				</div>
			</div>

			{showRegistrationModal && account && (
				<UsernameRegistrationModal isOpen={showRegistrationModal} onComplete={handleUsernameComplete} />
			)}
		</div>
	);
}
