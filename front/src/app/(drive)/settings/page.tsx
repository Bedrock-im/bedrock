"use client";

import CreditTopUp from "@/components/CreditTopUp";
import EraseData from "@/components/EraseData";
import { useCredits } from "@/hooks/use-credits";
import { useAccountStore } from "@/stores/account";

export const dynamic = "force-dynamic";

export default function Settings() {
	const { bedrockClient } = useAccountStore();
	const { creditBalance, refreshCredits } = useCredits();

	if (bedrockClient === null) {
		return <></>;
	}

	return (
		<div className="space-y-6">
			<CreditTopUp creditBalance={creditBalance} onTopUpComplete={refreshCredits} />
			<EraseData />
		</div>
	);
}
