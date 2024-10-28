"use client";

import { useLogout, usePrivy } from "@privy-io/react-auth";
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from "lucide-react";
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";

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
import { shrink_eth_address } from "@/utils/ethereum";

const BedrockAccountAvatar = () => {
	const account = useAccount();
	const { user: privyUser } = usePrivy();
	const { data: ensName } = useEnsName({ address: account.address });
	const { data: ensAvatar } = useEnsAvatar({ name: ensName ?? "" });

	return (
		<>
			{/*TODO: add default avatar picture*/}
			<Avatar className="h-8 w-8 rounded-lg" src={ensAvatar ?? undefined} alt="CN" />
			<div className="grid flex-1 text-left text-sm leading-tight">
				<span className="truncate font-semibold">{ensName ?? shrink_eth_address(account.address ?? "")}</span>
				{privyUser?.email?.address && <span className="truncate text-xs">{privyUser?.email?.address}</span>}
			</div>
		</>
	);
};

export const BedrockAccountMenu = () => {
	const { disconnect } = useDisconnect();
	const { logout } = useLogout();

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
						<Sparkles />
						Upgrade to Pro
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<BadgeCheck />
						Account
					</DropdownMenuItem>
					<DropdownMenuItem>
						<CreditCard />
						Billing
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Bell />
						Notifications
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={async () => {
						disconnect();
						await logout();
					}}
					className="cursor-pointer"
				>
					<LogOut />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
