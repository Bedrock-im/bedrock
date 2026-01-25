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
					<section className="flex flex-col h-screen">
						<header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sticky top-0 z-10">
							<SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
							<div className="h-4 w-px bg-border" />
							<div className="flex-1" />
						</header>
						<main className="flex-1 overflow-auto p-6 animate-fade-in">{children}</main>
					</section>
				</NuqsAdapter>
			</BedrockSidebar>
		</AuthWrapper>
	);
}
