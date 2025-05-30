import { Meta, StoryObj } from "@storybook/nextjs";

import { Input, InputProps } from "@/components/ui/input";

const meta: Meta<InputProps> = {
	component: Input,
	title: "Input",
	args: {
		disabled: false,
		className: "",
	},
	argTypes: {
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

const Render = (args: InputProps) => <Input {...args} defaultValue="Text value" />;

export const LightMode: Story = {
	args: {
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
