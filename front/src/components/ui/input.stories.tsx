import { Meta, StoryObj } from "@storybook/react";

import { Input, InputProps } from "@/components/ui/input";

const meta: Meta<InputProps> = {
	component: Input,
	title: "Input",
	args: {
		value: "Text input",
		disabled: false,
		className: "",
	},
	argTypes: {
		value: {
			type: "string",
			control: "text",
		},
		disabled: {
			type: "boolean",
			control: "boolean",
		},
		className: {
			type: "string",
			control: "text",
		},
	},
};
type Story = StoryObj<InputProps>;

const Render = (args: InputProps) => <Input {...args} />;

export const LightMode: Story = {
	args: {
		value: "Text input",
		disabled: false,
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
		value: "Text input",
		disabled: false,
		className: "",
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
