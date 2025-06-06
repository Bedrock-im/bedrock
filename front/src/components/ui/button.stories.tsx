import { Meta, StoryObj } from "@storybook/nextjs";

import { Button, ButtonProps } from "@/components/ui/button";

const meta: Meta<ButtonProps> = {
	component: Button,
	title: "Button",
	args: {
		size: "default",
		children: "Button content",
		className: "",
	},
	argTypes: {
		variant: {
			type: "string",
			control: "select",
			options: ["default", "outline", "secondary", "destructive", "ghost", "link"],
		},
		size: {
			type: "string",
			control: "select",
			options: ["default", "sm", "lg", "icon"],
		},
		disabled: {
			type: "boolean",
			control: "boolean",
		},
		children: {
			type: "string",
			control: "text",
		},
		className: {
			type: "string",
			control: "text",
		},
	},
};
type Story = StoryObj<ButtonProps>;

const Render = (args: ButtonProps) => <Button {...args} />;

export const LightMode: Story = {
	args: {
		variant: "default",
		disabled: false,
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
		disabled: false,
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
