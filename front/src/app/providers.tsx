"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { type State, WagmiProvider } from "wagmi";

import { config } from "@/config/wagmi";

type Props = {
	children: ReactNode;
	initialState: State | undefined;
};

export function Providers({ children, initialState }: Props) {
	const queryClient = new QueryClient();

	return (
		<WagmiProvider config={config} initialState={initialState}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</WagmiProvider>
	);
}
