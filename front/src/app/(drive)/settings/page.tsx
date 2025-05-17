"use client";

import EraseData from "@/components/EraseData";
import { useAccountStore } from "@/stores/account";

export default function Settings() {
	const { bedrockService } = useAccountStore();

	if (bedrockService === null) {
		return <></>;
	}

	return (
		<>
			<EraseData />
		</>
	);
}
