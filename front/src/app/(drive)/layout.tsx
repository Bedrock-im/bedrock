import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ReactNode } from "react";

import { AuthWrapper } from "@/components/AuthWrapper";
import { BedrockSidebar } from "@/components/BedrockSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function DriveLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<AuthWrapper>
			<BedrockSidebar>
				<NuqsAdapter>
					<section>
						<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
							<div className="flex items-center gap-2 px-4">
								<SidebarTrigger />
							</div>
						</header>
						{children}
					</section>
				</NuqsAdapter>
			</BedrockSidebar>
		</AuthWrapper>
	);
}
