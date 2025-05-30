import { Meta, StoryObj } from "@storybook/nextjs";

import { Checkbox, CheckboxProps } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const meta: Meta<CheckboxProps> = {
	component: Checkbox,
	title: "Checkbox",
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
type Story = StoryObj<CheckboxProps>;

const Render = (args: CheckboxProps) => (
	<div className="flex items-center gap-x-2">
		<Checkbox id="enable" {...args} />
		<Label htmlFor="enable">Enable cookies</Label>
	</div>
);

export const LightMode: Story = {
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
