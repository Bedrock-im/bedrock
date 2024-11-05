import { ReactNode } from "react";

import { AuthWrapper } from "@/components/AuthWrapper";
import { BedrockSidebar } from "@/components/BedrockSidebar";

import SetupFileList from "./setupFileList";

export default function DriveLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<AuthWrapper>
			<BedrockSidebar>{children}
				<SetupFileList/>
			</BedrockSidebar>
		</AuthWrapper>
	);
}
