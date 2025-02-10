import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ReactNode } from "react";

import SetupFileList from "@/app/(drive)/SetupFileList";
import { AuthWrapper } from "@/components/AuthWrapper";
import { BedrockSidebar } from "@/components/BedrockSidebar";

export default function DriveLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<AuthWrapper>
			<BedrockSidebar>
				{children}
				<NuqsAdapter>
					<SetupFileList/>
				</NuqsAdapter>
			</BedrockSidebar>
		</AuthWrapper>
	);
}
