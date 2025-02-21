"use client";

import { Button } from "@/components/ui/button";
import { useAccountStore } from "@/stores/account";

export default function Settings() {
	const { bedrockService } = useAccountStore();

	if (bedrockService === null) {
		return <></>;
	}

	return (
		<>
			<Button variant="outline" onClick={() => bedrockService.resetData()}>
				Reset all data
			</Button>
		</>
	);
}
