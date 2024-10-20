"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";

import { Button } from "@/components/ui/button";

export default function Home() {
	const { login } = usePrivy();
	const account = useAccount();
	return (
		<>
			<Button onClick={login}>Login with Privy</Button>
			{account.address ?? "Not connected"}
		</>
	);
}
