"use client";

import { LoaderIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";

type AuthWrapperProps = {
	children: ReactNode;
};

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
	const [_authChecked, setAuthChecked] = useState(false);
	const [currentAuthStatus, setCurrentAuthStatus] = useState<boolean | undefined>(undefined);
	const latestIsConnected = useRef<boolean>();

	const account = useAccount();
	const router = useRouter();

	const checkAuthStatus = useCallback(() => {
		if (latestIsConnected.current === undefined) {
			return;
		}

		if (!latestIsConnected.current) {
			router.push("/auth");
		}
		latestIsConnected.current = undefined;
		setAuthChecked(true);
	}, [latestIsConnected, router]);

	useEffect(() => {
		setCurrentAuthStatus(account.isConnected);
		if (latestIsConnected.current === undefined) {
			latestIsConnected.current = account.isConnected;
			setTimeout(() => {
				checkAuthStatus();
			}, 2000);
		}
	}, [account, checkAuthStatus, currentAuthStatus]);

	if (currentAuthStatus) {
		return <>{children}</>;
	} else {
		return <LoaderIcon className="animate-spin m-auto h-[100vh]" />;
	}
};
