import { Meta, StoryObj } from "@storybook/react";

import { Avatar, AvatarProps } from "@/components/ui/avatar";

const meta: Meta<AvatarProps> = {
	component: Avatar,
	title: "Avatar",
	args: {
		src: "https://avatars.githubusercontent.com/u/33784129?v=4",
		alt: "EdenComp",
		className: "",
	},
	argTypes: {
		src: {
			type: "string",
			control: "text",
		},
		alt: {
			type: "string",
			control: "text",
		},
		className: {
			type: "string",
			control: "text",
		},
	},
};
type Story = StoryObj<AvatarProps>;

const Render = (args: AvatarProps) => <Avatar {...args} />;

export const Default: Story = {
	args: {
		src: "https://avatars.githubusercontent.com/u/33784129?v=4",
		alt: "EdenComp",
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
		src: "https://avatars.githubusercontent.com/u/33784129?v=4",
		alt: "EdenComp",
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
