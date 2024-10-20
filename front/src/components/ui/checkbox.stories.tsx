import { Meta, StoryObj } from "@storybook/react";

import { Checkbox, CheckboxProps } from "@/components/ui/checkbox";

const meta: Meta<CheckboxProps> = {
	component: Checkbox,
	title: "Checkbox",
	args: {
		children: "Enable checkbox",
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
type Story = StoryObj<CheckboxProps>;

const Render = (args: Meta<CheckboxProps>) => <Checkbox {...args} />;

export const Default: Story = {
	args: {
		className: "",
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
		className: "",
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
