import { Meta, StoryObj } from "@storybook/nextjs";

import { Progress, ProgressProps } from "@/components/ui/progress";

const meta: Meta<ProgressProps> = {
	component: Progress,
	title: "Progress",
	args: {
		value: 20,
		className: "",
	},
	argTypes: {
		value: {
			type: "string",
			control: "number",
		},
		className: {
			type: "string",
			control: "text",
		},
	},
};
type Story = StoryObj<ProgressProps>;

const Render = (args: ProgressProps) => <Progress {...args} />;

export const LightMode: Story = {
	args: {
		value: 20,
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
		value: 20,
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
