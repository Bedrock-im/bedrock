"use client";

import { BadgeCheck, Bell, ChevronsUpDown, LogOut, WrenchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActiveAccount, useActiveWallet, useDisconnect } from "thirdweb/react";

import { Avatar } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { shrinkEthAddress } from "@/utils/ethereum";

const BedrockAccountAvatar = () => {
	const account = useActiveAccount();

	if (account === undefined) {
		return null;
	}

	return (
		<>
			{/*TODO: add default avatar picture*/}
			<Avatar className="h-8 w-8 rounded-lg" alt="CN" />
			<div className="grid flex-1 text-left text-sm leading-tight">
				<span className="truncate font-semibold">{shrinkEthAddress(account.address ?? "")}</span>
			</div>
		</>
	);
};

export const BedrockAccountMenu = () => {
	const wallet = useActiveWallet();
	const { disconnect } = useDisconnect();
	const router = useRouter();

	if (wallet === undefined) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<SidebarMenuButton
					size="lg"
					className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
				>
					<BedrockAccountAvatar />
					<ChevronsUpDown className="ml-auto size-4" />
				</SidebarMenuButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
				side="bottom"
				align="end"
				sideOffset={4}
			>
				<DropdownMenuLabel className="p-0 font-normal">
					<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<BedrockAccountAvatar />
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<BadgeCheck />
						Account
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => router.push("/settings")}>
						<WrenchIcon />
						Settings
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Bell />
						Notifications
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => disconnect(wallet)} className="cursor-pointer">
					<LogOut />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
