import { Meta, StoryObj } from "@storybook/react";

import { Slider, SliderProps as DefaultSliderProps } from "@/components/ui/slider";

type SliderProps = Omit<DefaultSliderProps, "value"> & {
	value: number;
};

const meta: Meta<DefaultSliderProps> = {
	component: Slider,
	title: "Slider",
	args: {
		value: [20],
		min: 0,
		max: 100,
		disabled: false,
		className: "",
	},
	argTypes: {
		value: {
			type: "number",
			control: "number",
		},
		min: {
			type: "number",
			control: "number",
		},
		max: {
			type: "number",
			control: "number",
		},
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

const Render = (args: SliderProps) => <Slider {...args} value={[args.value]} />;

export const LightMode: Story = {
	args: {
		value: 20,
		min: 0,
		max: 100,
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
		value: 20,
		min: 0,
		max: 100,
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
