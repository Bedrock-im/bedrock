import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ReactNode } from "react";

import { AuthWrapper } from "@/components/AuthWrapper";
import { BedrockSidebar } from "@/components/BedrockSidebar";

export default function DriveLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<AuthWrapper>
			<BedrockSidebar>
				<NuqsAdapter>
					<>{children}</>
				</NuqsAdapter>
			</BedrockSidebar>
		</AuthWrapper>
	);
}
