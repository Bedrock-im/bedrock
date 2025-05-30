import { Meta, StoryObj } from "@storybook/nextjs";

import { Label } from "@/components/ui/label";
import { Switch, SwitchProps } from "@/components/ui/switch";

const meta: Meta<SwitchProps> = {
	component: Switch,
	title: "Switch",
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
type Story = StoryObj<SwitchProps>;

const Render = (args: SwitchProps) => (
	<div className="flex items-center gap-x-2">
		<Switch id="enable" {...args} />
		<Label htmlFor="enable">Enable cookies</Label>
	</div>
);

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
