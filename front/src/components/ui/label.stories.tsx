import { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label, LabelProps } from "@/components/ui/label";

const meta: Meta<LabelProps> = {
	component: Label,
	title: "Label",
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
type Story = StoryObj<LabelProps>;

const Render = (args: LabelProps) => (
	<div className="flex items-center space-x-2">
		<Checkbox id="example" />
		<Label htmlFor="example" {...args}>
			Click me!
		</Label>
	</div>
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
			<Render {...args} />
		</div>
	),
};

export default meta;
