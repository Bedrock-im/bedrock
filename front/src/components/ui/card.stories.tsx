import { Meta, StoryObj } from "@storybook/nextjs";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const meta: Meta = {
	component: Card,
	title: "Card",
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
	<Card {...args}>
		<CardHeader>
			<CardTitle>Card Title</CardTitle>
			<CardDescription>Small description of the content of the card</CardDescription>
		</CardHeader>
		<CardContent>Card content</CardContent>
		<CardFooter>Card footer</CardFooter>
	</Card>
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
