import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useActiveAccount } from "thirdweb/react";

import { useAccountStore } from "@/stores/account";

export function useRequireAuth() {
	const isConnected = useAccountStore((state) => state.isConnected);
	const account = useActiveAccount();
	const router = useRouter();

	useEffect(() => {
		if (!isConnected || !account) {
			toast.error("Authentication Required", {
				description: "Please connect your wallet & sign the message to access this page",
				duration: 5000,
			});
			router.push("/auth");
		}
	}, [isConnected, account, router]);

	return { isConnected };
}
