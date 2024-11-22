import { ReactNode } from "react";

import SetupFileList from "@/app/(drive)/SetupFileList";
import { AuthWrapper } from "@/components/AuthWrapper";
import { BedrockSidebar } from "@/components/BedrockSidebar";

import FileList from "@/components/drive/FileList";

export default function DriveLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<AuthWrapper>
			<BedrockSidebar>
				{children}
				<FileList />
			</BedrockSidebar>
		</AuthWrapper>
	);
}
