"use client";

import EraseData from "@/components/EraseData";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccountStore } from "@/stores/account";

export const dynamic = "force-dynamic";

export default function Settings() {
	const { bedrockClient } = useAccountStore();
	const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";

	if (bedrockClient === null) {
		return <></>;
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Theme</CardTitle>
					<CardDescription>
						Choose how Bedrock looks to you. Select a theme or let the app follow your system settings.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ThemeToggle />
				</CardContent>
			</Card>
			{isLocalhost && <EraseData />}
		</div>
	);
}
