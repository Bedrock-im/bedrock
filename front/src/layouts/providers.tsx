"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { ThirdwebProvider } from "thirdweb/react";

import { Watchers } from "@/layouts/watchers";

type ProvidersProps = {
	children: ReactNode;
};

const queryClient = new QueryClient();

export function Providers({ children }: ProvidersProps) {
	return (
		<QueryClientProvider client={queryClient}>
			<ThirdwebProvider>
				<Watchers>{children}</Watchers>
			</ThirdwebProvider>
		</QueryClientProvider>
	);
}
