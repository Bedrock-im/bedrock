import { Meta, StoryObj } from "@storybook/react";

import { Badge, BadgeProps } from "@/components/ui/badge";

const meta: Meta<BadgeProps> = {
	component: Badge,
	title: "Badge",
	args: {
		size: "default",
		children: "Badge content",
		className: "",
	},
	argTypes: {
		variant: {
			type: "string",
			control: "select",
			options: ["default", "outline", "secondary", "destructive"],
		},
		size: {
			type: "string",
			control: "select",
			options: ["default", "sm", "lg"],
		},
		className: {
			type: "string",
			control: "text",
		},
	},
};
type Story = StoryObj<BadgeProps>;

const Render = (args: BadgeProps) => <Badge {...args} />;

export const Default: Story = {
	args: {
		variant: "default",
		size: "default",
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
		variant: "default",
		size: "default",
	},
	parameters: {
		backgrounds: {
			default: "dark",
		},
	},
	render: (args) => (
		<div className="dark">
			<Render {...args} />
		</div>
	),
};

export default meta;
