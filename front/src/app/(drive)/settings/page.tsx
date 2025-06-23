"use client";

import CreditTopUp from "@/components/CreditTopUp";
import EraseData from "@/components/EraseData";
import { useCredits } from "@/hooks/use-credits";
import { useAccountStore } from "@/stores/account";

export default function Settings() {
	const { bedrockService } = useAccountStore();
	const { creditBalance, refreshCredits } = useCredits();

	if (bedrockService === null) {
		return <></>;
	}

	return (
		<div className="space-y-6">
			<CreditTopUp creditBalance={creditBalance} onTopUpComplete={refreshCredits} />
			<EraseData />
		</div>
	);
}
