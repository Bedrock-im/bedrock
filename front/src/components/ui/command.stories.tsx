import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import {
	Command,
	CommandDialog,
	CommandDialogProps,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";

type CommandProps = Omit<CommandDialogProps, "onEvent"> & {
	inputKey: string;
	inputCtrl: boolean;
};

const meta: Meta<CommandProps> = {
	component: Command,
	title: "Command",
	args: {
		inputKey: "m",
		inputCtrl: true,
	},
	argTypes: {
		inputKey: {
			type: "string",
			control: "text",
		},
		inputCtrl: {
			type: "boolean",
			control: "boolean",
		},
	},
};
type Story = StoryObj<CommandProps>;
type DarkModeMeta = CommandProps & { dark?: boolean };

const Render = (args: DarkModeMeta) => {
	const [open, setOpen] = React.useState(false);
	const onEvent = React.useMemo(
		() => (e: KeyboardEvent) => {
			const key = e.key.toLowerCase() === args.inputKey.toLowerCase();
			const ctrl = args.inputCtrl ? e.metaKey || e.ctrlKey : true;

			return key && ctrl;
		},
		[args],
	);

	return (
		<>
			<div className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed border-primary text-sm text-primary">
				Type {args.inputCtrl ? "CTRL+" : ""}
				{args.inputKey.toUpperCase()} to open
			</div>
			<CommandDialog {...args} onEvent={onEvent} open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Type a command or search..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Suggestions">
						<CommandItem>My files</CommandItem>
						<CommandItem>Shared with me</CommandItem>
						<CommandItem>Trash</CommandItem>
					</CommandGroup>
					<CommandSeparator />
					<CommandGroup heading="Settings">
						<CommandItem>Profile</CommandItem>
						<CommandItem>Contacts</CommandItem>
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</>
	);
};

export const LightMode: Story = {
	parameters: {
		backgrounds: {
			default: "light",
		},
	},
	render: Render,
};

export const DarkMode: Story = {
	parameters: {
		backgrounds: {
			default: "dark",
		},
	},
	render: (args) => (
		<div className="dark">
			<Render {...args} dark />
		</div>
	),
};

export default meta;
