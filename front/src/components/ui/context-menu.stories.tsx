import { Meta, StoryObj } from "@storybook/react";

import {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";

const meta: Meta = {
	component: ContextMenu,
	title: "Context Menu",
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
	<ContextMenu {...args}>
		<ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed border-primary text-sm text-primary">
			Right click here
		</ContextMenuTrigger>
		<ContextMenuContent className={args.dark ? "dark" : ""}>
			<ContextMenuItem inset>
				Back
				<ContextMenuShortcut>⌘[</ContextMenuShortcut>
			</ContextMenuItem>
			<ContextMenuItem inset disabled>
				Forward
				<ContextMenuShortcut>⌘]</ContextMenuShortcut>
			</ContextMenuItem>
			<ContextMenuItem inset>
				Reload
				<ContextMenuShortcut>⌘R</ContextMenuShortcut>
			</ContextMenuItem>
			<ContextMenuSub>
				<ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
				<ContextMenuSubContent className="w-48">
					<ContextMenuItem>
						Save Page As...
						<ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
					</ContextMenuItem>
					<ContextMenuItem>Create Shortcut...</ContextMenuItem>
					<ContextMenuItem>Name Window...</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem>Developer Tools</ContextMenuItem>
				</ContextMenuSubContent>
			</ContextMenuSub>
			<ContextMenuSeparator />
			<ContextMenuCheckboxItem checked>
				Show Bookmarks Bar
				<ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
			</ContextMenuCheckboxItem>
			<ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
			<ContextMenuSeparator />
			<ContextMenuRadioGroup value="right">
				<ContextMenuLabel inset>Controls</ContextMenuLabel>
				<ContextMenuRadioItem value="left">Left click</ContextMenuRadioItem>
				<ContextMenuRadioItem value="right">Right click</ContextMenuRadioItem>
			</ContextMenuRadioGroup>
		</ContextMenuContent>
	</ContextMenu>
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
