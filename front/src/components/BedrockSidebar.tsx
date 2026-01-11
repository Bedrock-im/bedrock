"use client";

import { FolderIcon, HardDrive, Library, Share2, Trash2, Users } from "lucide-react";
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
									<div className="flex aspect-square size-10 items-center justify-center rounded-xl gradient-primary shadow-soft">
										<HardDrive className="size-5 text-white" />
									</div>
									<div className="grid flex-1 text-left leading-tight">
										<span className="truncate text-lg font-bold tracking-tight">Bedrock</span>
										<span className="truncate text-xs text-muted-foreground">Decentralized Storage</span>
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
										<Link href={item.url} className="flex items-center gap-3 px-3">
											<item.icon className={`size-5 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} />
											<span className={`font-medium ${active ? "" : "text-foreground"}`}>{item.name}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							);
						})}
					</SidebarMenu>
				</SidebarContent>
				<SidebarFooter className="p-3">
					<div className="rounded-xl bg-accent/50 p-3 mb-2">
						<div className="flex items-center justify-between mb-2">
							<span className="text-xs font-medium text-muted-foreground">Storage Used</span>
							<span className="text-xs font-semibold text-foreground">2.4 GB</span>
						</div>
						<div className="h-2 w-full rounded-full bg-muted overflow-hidden">
							<div className="h-full w-1/4 rounded-full gradient-primary transition-all duration-500" />
						</div>
						<p className="text-2xs text-muted-foreground mt-1.5">of 10 GB used</p>
					</div>
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
