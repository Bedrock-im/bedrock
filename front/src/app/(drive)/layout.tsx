import { ReactNode } from "react";

import { AuthWrapper } from "@/components/AuthWrapper";
import { BedrockSidebar } from "@/components/BedrockSidebar";

import FileList from "@/components/drive/fileList";

export default function DriveLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<AuthWrapper>
			<BedrockSidebar>
				{children}
				<FileList pageType={"My files"} />
			</BedrockSidebar>
		</AuthWrapper>
	);
}
