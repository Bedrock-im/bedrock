"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActiveAccount } from "thirdweb/react";

import { checkUsernameAvailableAvailableGet, registerUsernameRegisterPost } from "@/apis/usernames";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccountStore } from "@/stores/account";

interface UsernameRegistrationModalProps {
	isOpen: boolean;
	onComplete: () => void;
}

export function UsernameRegistrationModal({ isOpen, onComplete }: UsernameRegistrationModalProps) {
	const [username, setUsername] = useState("");
	const [isAvailable, setIsAvailable] = useState(false);
	const [isChecking, setIsChecking] = useState(false);
	const [isRegistering, setIsRegistering] = useState(false);
	const account = useActiveAccount();
	const setStoreUsername = useAccountStore((state) => state.setUsername);

	useEffect(() => {
		if (!username) {
			setIsAvailable(false);
			return;
		}

		const checkAvailability = async () => {
			if (username.length < 3) return;

			setIsChecking(true);
			try {
				const result = await checkUsernameAvailableAvailableGet({
					query: { username },
				});
				setIsAvailable(result.data?.available === true);
			} catch (error) {
				console.error("Error checking username availability:", error);
				setIsAvailable(false);
			} finally {
				setIsChecking(false);
			}
		};

		const debounce = setTimeout(checkAvailability, 500);
		return () => clearTimeout(debounce);
	}, [username]);

	const handleRegister = async () => {
		if (!account?.address || !username || !isAvailable) return;

		setIsRegistering(true);
		try {
			await registerUsernameRegisterPost({
				body: {
					username,
					address: account.address,
				},
			});

			// Update the global store with the new username
			setStoreUsername(username);

			toast.success("Username registered successfully!");
			onComplete();
		} catch (error) {
			console.error("Error registering username:", error);
			toast.error("Failed to register username", {
				description: "Please try again later",
			});
		} finally {
			setIsRegistering(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onComplete()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Register Your Username</DialogTitle>
					<DialogDescription>Choose a unique username to identify yourself in the Bedrock ecosystem.</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="username" className="text-right">
							Username
						</Label>
						<div className="col-span-3">
							<Input
								id="username"
								placeholder="myusername"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className={isChecking ? "opacity-70" : ""}
								disabled={isChecking || isRegistering}
							/>
							{username.length > 0 && (
								<p className={`text-sm mt-1 ${isAvailable ? "text-green-500" : "text-red-500"}`}>
									{isChecking
										? "Checking availability..."
										: isAvailable
											? "Username available!"
											: "Username unavailable"}
								</p>
							)}
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button onClick={handleRegister} disabled={!isAvailable || isRegistering} className="w-full">
						{isRegistering ? "Registering..." : "Register Username"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
