"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { ThirdwebProvider } from "thirdweb/react";

import { client as usernamesClient } from "@/apis/usernames/client.gen";
import env from "@/config/env";
import { Watchers } from "@/layouts/watchers";

type ProvidersProps = {
	children: ReactNode;
};

const queryClient = new QueryClient();

// Configure the usernames client with the given base URL
usernamesClient.setConfig({
	baseURL: env.USERNAMES_API_URL,
});

export function Providers({ children }: ProvidersProps) {
	return (
		<QueryClientProvider client={queryClient}>
			<ThirdwebProvider>
				<Watchers>{children}</Watchers>
			</ThirdwebProvider>
		</QueryClientProvider>
	);
}
