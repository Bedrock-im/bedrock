import { Meta, StoryObj } from "@storybook/react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const meta: Meta = {
	component: DropdownMenu,
	title: "Dropdown Menu",
	args: {
		className: "",
	},
	argTypes: {
		className: {
			type: "string",
			control: "text",
		},
	},
};
type Story = StoryObj;
type DarkModeMeta = Meta & { dark?: boolean };

const Render = (args: DarkModeMeta) => (
	<DropdownMenu {...args}>
		<DropdownMenuTrigger>Open</DropdownMenuTrigger>
		<DropdownMenuContent className={args.dark ? "dark" : ""}>
			<DropdownMenuLabel>My Account</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<DropdownMenuItem>My files</DropdownMenuItem>
			<DropdownMenuItem>Shared with me</DropdownMenuItem>
			<DropdownMenuItem>Trash</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
);

export const Default: Story = {
	args: {
		className: "",
	},
	parameters: {
		backgrounds: {
			default: "light",
		},
	},
	render: Render,
};

export const DarkMode: Story = {
	args: {
		className: "",
	},
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
