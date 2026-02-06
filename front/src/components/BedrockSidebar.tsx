"use client";

import { FolderIcon, Library, Share2, Trash2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { BedrockAccountMenu } from "@/components/BedrockAccountMenu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarRail,
} from "@/components/ui/sidebar";

const items = [
	{
		name: "My Files",
		url: "/",
		icon: FolderIcon,
	},
	{
		name: "Shared with Me",
		url: "/shared",
		icon: Share2,
	},
	{
		name: "Contacts",
		url: "/contacts",
		icon: Users,
	},
	{
		name: "Knowledge Bases",
		url: "/knowledge-bases",
		icon: Library,
	},
	{
		name: "Trash",
		url: "/trash",
		icon: Trash2,
	},
];

type BedrockSidebarProps = {
	children: ReactNode;
};

export const BedrockSidebar = ({ children }: BedrockSidebarProps) => {
	const pathname = usePathname();

	const isActive = (url: string) => {
		if (url === "/") {
			return pathname === "/";
		}
		return pathname.startsWith(url);
	};

	return (
		<SidebarProvider>
			<Sidebar collapsible="icon" className="border-r-0">
				<SidebarHeader className="p-4">
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
								<Link href="/" className="flex items-center gap-3">
									<div className="flex aspect-square items-center justify-center rounded-xl">
										<Image src="/logo.png" alt="Bedrock Logo" width={48} height={48} />
									</div>
									<div className="grid flex-1 text-left leading-tight">
										<span className="truncate text-lg font-bold tracking-tight">Bedrock</span>
									</div>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>
				<SidebarContent className="px-3 py-2">
					<SidebarMenu className="space-y-1">
						{items.map((item) => {
							const active = isActive(item.url);
							return (
								<SidebarMenuItem key={item.name}>
									<SidebarMenuButton
										asChild
										className={`
											h-11 rounded-xl transition-all duration-200
											${active ? "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90" : "hover:bg-accent"}
										`}
									>
										<Link
											href={item.url}
											className="flex items-center gap-3 px-3"
											aria-current={active ? "page" : undefined}
										>
											<item.icon
												className={`size-5 ${active ? "text-primary-foreground" : "text-muted-foreground"}`}
												aria-hidden="true"
											/>
											<span className={`font-medium ${active ? "" : "text-foreground"}`}>{item.name}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							);
						})}
					</SidebarMenu>
				</SidebarContent>
				<SidebarFooter className="p-3">
					<SidebarMenu>
						<SidebarMenuItem>
							<BedrockAccountMenu />
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
				<SidebarRail />
			</Sidebar>
			<SidebarInset className="bg-background">{children}</SidebarInset>
		</SidebarProvider>
	);
};
