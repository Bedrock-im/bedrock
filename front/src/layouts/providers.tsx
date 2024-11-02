"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";

import env from "@/config/env";
import { privyConfig } from "@/config/privy";
import { wagmiConfig } from "@/config/wagmi";
import { Watchers } from "@/layouts/watchers";

type ProvidersProps = {
	children: ReactNode;
};

const queryClient = new QueryClient();

export function Providers({ children }: ProvidersProps) {
	return (
		<PrivyProvider appId={env.PRIVY_APP_ID} config={privyConfig}>
			<QueryClientProvider client={queryClient}>
				<WagmiProvider config={wagmiConfig}>
					<Watchers>{children}</Watchers>
				</WagmiProvider>
			</QueryClientProvider>
		</PrivyProvider>
	);
}
