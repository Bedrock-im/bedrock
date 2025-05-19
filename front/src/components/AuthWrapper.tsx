"use client";

import { LoaderIcon } from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";

import { UsernameRegistrationModal } from "@/components/UsernameRegistrationModal";
import { useRequireAuth } from "@/hooks/use-auth";
import { useAccountStore } from "@/stores/account";

type AuthWrapperProps = {
	children: ReactNode;
};

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
	const { isConnected } = useRequireAuth();
	const account = useActiveAccount();
	const { username, bedrockService } = useAccountStore();
	const [showRegistrationModal, setShowRegistrationModal] = useState(false);

	useEffect(() => {
		// If user has wallet connected, bedrock service set up, but no username
		if (account && bedrockService && !username) {
			setShowRegistrationModal(true);
		} else {
			setShowRegistrationModal(false);
		}
	}, [account, bedrockService, username]);

	const handleUsernameComplete = () => {
		setShowRegistrationModal(false);
	};

	if (!isConnected) {
		return <LoaderIcon className="animate-spin m-auto h-[100vh]" />;
	}

	return (
		<>
			{showRegistrationModal && (
				<UsernameRegistrationModal isOpen={showRegistrationModal} onComplete={handleUsernameComplete} />
			)}
			{username && children}
		</>
	);
};
