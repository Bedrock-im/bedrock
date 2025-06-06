"use client";

import { BadgeCheck, Bell, ChevronsUpDown, LogOut, Trash2, WrenchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActiveAccount, useActiveWallet, useDisconnect } from "thirdweb/react";

import { getAvatarUsernameUsernameAvatarGet } from "@/apis/usernames/sdk.gen";
import DeleteDialog from "@/components/drive/DeleteDialog";
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
import { useAccountStore } from "@/stores/account";
import { useDriveStore } from "@/stores/drive";
import { shrinkEthAddress } from "@/utils/ethereum";

const BedrockAccountAvatar = () => {
	const account = useActiveAccount();
	const username = useAccountStore((state) => state.username);
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

	useEffect(() => {
		const fetchAvatar = async () => {
			if (!username) return;

			try {
				const response = await getAvatarUsernameUsernameAvatarGet({
					path: { username },
				});

				if (response.data) {
					setAvatarUrl(response.data);
				}
			} catch (error) {
				console.error("Failed to fetch avatar:", error);
				setAvatarUrl(null);
			}
		};

		fetchAvatar();
	}, [username]);

	if (account === undefined) {
		return null;
	}

	return (
		<>
			<Avatar src={avatarUrl ?? `https://avatars.jakerunzer.com/${username}`} className="h-8 w-8 rounded-lg" />
			<div className="grid flex-1 text-left text-sm leading-tight">
				<span className="truncate font-semibold">{username ? username : shrinkEthAddress(account.address ?? "")}</span>
			</div>
		</>
	);
};

export const BedrockAccountMenu = () => {
	const [confirmDataResetDialogOpen, setConfirmDataResetDialogOpen] = useState(false);
	const wallet = useActiveWallet();
	const { disconnect } = useDisconnect();
	const router = useRouter();
	const { bedrockService } = useAccountStore();
	const { setFiles, setFolders } = useDriveStore();

	if (wallet === undefined || bedrockService === null) {
		return null;
	}

	const handleDataDeletion = async () => {
		setConfirmDataResetDialogOpen(false);

		try {
			await bedrockService.resetData();
			toast.success("All data has been deleted");
			setFiles([]);
			setFolders([]);
		} catch (error) {
			console.error("Failed to delete data:", error);
			toast.error("Failed to delete data");
		}
	};

	return (
		<>
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
					<DropdownMenuItem onClick={() => setConfirmDataResetDialogOpen(true)} className="text-red-500">
						<Trash2 />
						Delete my data
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => disconnect(wallet)} className="cursor-pointer">
						<LogOut />
						Log out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<DeleteDialog
				title="Confirm data deletion"
				description="This action cannot be undone. This will permanently delete your data from the service and all subsequent
							storage locations."
				onDelete={handleDataDeletion}
				onOpenChange={(open) => setConfirmDataResetDialogOpen(open)}
				open={confirmDataResetDialogOpen}
			/>
		</>
	);
};
