import { Meta, StoryObj } from "@storybook/react";

import { Slider, SliderProps } from "@/components/ui/slider";

const meta: Meta<SliderProps> = {
	component: Slider,
	title: "Slider",
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
type Story = StoryObj<SliderProps>;

const Render = (args: SliderProps) => <Slider {...args} defaultValue={[20]} min={0} max={100} />;

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
