import { Meta, StoryObj } from "@storybook/nextjs";

import { Tooltip, TooltipContent, TooltipProps, TooltipTrigger } from "@/components/ui/tooltip";

const meta: Meta = {
	component: Tooltip,
	title: "Tooltip",
	args: {
		delayDuration: 0,
	},
	argTypes: {
		delayDuration: {
			type: "number",
			control: "number",
		},
	},
};

type Story = StoryObj<TooltipProps>;

const Render = (args: TooltipProps) => (
	<Tooltip {...args}>
		<TooltipTrigger>Hover</TooltipTrigger>
		<TooltipContent>
			<p>Add to library</p>
		</TooltipContent>
	</Tooltip>
);

export const LightMode: Story = {
	args: {
		delayDuration: 0,
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
		delayDuration: 0,
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
