import { Meta, StoryObj } from "@storybook/react";

import { Skeleton } from "@/components/ui/skeleton";

const meta: Meta = {
	component: Skeleton,
	title: "Skeleton",
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

type Story = StoryObj;

const Render = (args: object) => (
	<div className="w-[50%] h-[200px]">
		<Skeleton {...args} />
	</div>
);

export const Default: Story = {
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
