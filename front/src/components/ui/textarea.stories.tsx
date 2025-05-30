import { Meta, StoryObj } from "@storybook/nextjs";

import { Textarea, TextareaProps } from "@/components/ui/textarea";

const meta: Meta<TextareaProps> = {
	component: Textarea,
	title: "Textarea",
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
type Story = StoryObj<TextareaProps>;

const Render = (args: TextareaProps) => <Textarea {...args} />;

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
