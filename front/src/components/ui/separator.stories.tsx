import { Meta, StoryObj } from "@storybook/react";

import { Separator, SeparatorProps } from "@/components/ui/separator";

const meta: Meta<SeparatorProps> = {
	component: Separator,
	title: "Separator",
	args: {
		orientation: "horizontal",
		className: "",
	},
	argTypes: {
		orientation: {
			type: "string",
			control: "select",
			options: ["horizontal", "vertical"],
		},
		className: {
			type: "string",
			control: "text",
		},
	},
};

type Story = StoryObj<SeparatorProps>;

const Render = (args: SeparatorProps) => (
	<div className={args.orientation === "horizontal" ? "flex flex-col gap-4" : "flex flex-row gap-4"}>
		<p className="text-primary">Text1</p>
		<Separator {...args} />
		<p className="text-primary">Text2</p>
	</div>
);

export const LightMode: Story = {
	args: {
		orientation: "horizontal",
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
		orientation: "horizontal",
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
