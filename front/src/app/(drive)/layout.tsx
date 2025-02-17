import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ReactNode } from "react";

import { AuthWrapper } from "@/components/AuthWrapper";
import { BedrockSidebar } from "@/components/BedrockSidebar";
import FileList from "@/components/drive/FileList";

export default function DriveLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<AuthWrapper>
			<BedrockSidebar>
				{children}
				<NuqsAdapter>
					<FileList pageType={"My files"}/>
				</NuqsAdapter>
			</BedrockSidebar>
		</AuthWrapper>
	);
}
