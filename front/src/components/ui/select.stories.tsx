import { Meta, StoryObj } from "@storybook/react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const meta: Meta = {
	component: Select,
	title: "Select",
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
	<Select {...args}>
		<SelectTrigger className="w-[180px]">
			<SelectValue placeholder="Content type" />
		</SelectTrigger>
		<SelectContent className={args.dark ? "dark" : ""}>
			<SelectItem value="text">Text</SelectItem>
			<SelectItem value="image">Image</SelectItem>
			<SelectItem value="video">Video</SelectItem>
		</SelectContent>
	</Select>
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
