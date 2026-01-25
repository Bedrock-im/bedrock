"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { ThirdwebProvider } from "thirdweb/react";

import { client as usernamesClient } from "@/apis/usernames/client.gen";
import { ThemeProvider } from "@/components/ThemeProvider";
import env from "@/config/env";
import { Watchers } from "@/layouts/watchers";

type ProvidersProps = {
	children: ReactNode;
};

const queryClient = new QueryClient();

usernamesClient.setConfig({
	baseURL: env.USERNAMES_API_URL,
});

export function Providers({ children }: ProvidersProps) {
	return (
		<QueryClientProvider client={queryClient}>
			<ThirdwebProvider>
				<ThemeProvider>
					<Watchers>{children}</Watchers>
				</ThemeProvider>
			</ThirdwebProvider>
		</QueryClientProvider>
	);
}
