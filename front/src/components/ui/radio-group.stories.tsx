import { Meta, StoryObj } from "@storybook/nextjs";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const meta: Meta = {
	component: RadioGroup,
	title: "Radio Group",
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
	<RadioGroup defaultValue="option-one" {...args}>
		<div className="flex items-center space-x-2">
			<RadioGroupItem value="option-one" id="option-one" />
			<Label htmlFor="option-one">Option One</Label>
		</div>
		<div className="flex items-center space-x-2">
			<RadioGroupItem value="option-two" id="option-two" />
			<Label htmlFor="option-two">Option Two</Label>
		</div>
		<div className="flex items-center space-x-2">
			<RadioGroupItem value="option-three" id="option-three" />
			<Label htmlFor="option-three">Option Three</Label>
		</div>
	</RadioGroup>
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
