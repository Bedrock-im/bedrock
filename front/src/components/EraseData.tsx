import { Shredder } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useAccountStore } from "@/stores/account";

export default function EraseData() {
	const { bedrockClient } = useAccountStore();

	const eraseData = async () => {
		await bedrockClient?.resetAllData();
		toast.success("Your account data was erased");
	};

	return (
		<Dialog>
			<DialogTrigger>
				<div className="flex flex-row items-center gap-2 ml-4">
					<Button variant="destructive" className="gap-2">
						<Shredder size={16} />
						Erase data
					</Button>
				</div>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Are you absolutely sure?</DialogTitle>
					<DialogDescription>
						You are about to delete your account. This action erases all your files, folders and contacts. This action
						cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button onClick={eraseData}>Confirm</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
