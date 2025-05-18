"use client";

import { Command, FolderIcon, Library, Share2, Trash2, Users } from "lucide-react";
import Link from "next/link";
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
		name: "My files",
		url: "/",
		icon: FolderIcon,
	},
	{
		name: "Shared with me",
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
	return (
		<SidebarProvider>
			<Sidebar collapsible="icon">
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton size="lg" asChild>
								<a href="#">
									<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
										<Command className="size-4" />
									</div>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">Bedrock</span>
									</div>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>
				<SidebarContent>
					<SidebarMenu>
						{items.map((item) => (
							<SidebarMenuItem key={item.name}>
								<SidebarMenuButton asChild>
									<Link href={item.url}>
										<item.icon />
										<span>{item.name}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarContent>
				{/*TODO: add a progress for file storage size like Proton*/}
				<SidebarFooter>
					<SidebarMenu>
						<SidebarMenuItem>
							<BedrockAccountMenu />
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
				<SidebarRail />
			</Sidebar>
			<SidebarInset>{children}</SidebarInset>
		</SidebarProvider>
	);
};
