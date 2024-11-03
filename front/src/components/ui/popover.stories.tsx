import { Meta, StoryObj } from "@storybook/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const meta: Meta = {
	component: Popover,
	title: "Popover",
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
type DarkModeMeta = { dark?: boolean; className?: string };

const Render = (args: DarkModeMeta) => (
	<Popover {...args}>
		<PopoverTrigger asChild>
			<Button variant="outline">Open</Button>
		</PopoverTrigger>
		<PopoverContent className={args.dark ? "dark w-80" : "w-80"}>
			<div className="grid gap-4">
				<div className="space-y-2">
					<h4 className="font-medium leading-none">File</h4>
					<p className="text-sm text-muted-foreground">Change file parameters</p>
				</div>
				<div className="grid gap-2">
					<div className="grid grid-cols-3 items-center gap-4">
						<Label htmlFor="name">File name</Label>
						<Input id="name" defaultValue="file.pdf" className="col-span-2 h-8" />
					</div>
				</div>
			</div>
		</PopoverContent>
	</Popover>
);

export const LightMode: Story = {
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
