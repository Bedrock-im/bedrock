import { Meta, StoryObj } from "@storybook/nextjs";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const meta: Meta = {
	component: Tabs,
	title: "Tabs",
};
type Story = StoryObj;

const Render = () => {
	return (
		<Tabs defaultValue="left" className="w-[50%]">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="left">Left</TabsTrigger>
				<TabsTrigger value="right">Right</TabsTrigger>
			</TabsList>
			<TabsContent value="left">
				<p className="text-primary">Welcome to the left tab</p>
			</TabsContent>
			<TabsContent value="right">
				<p className="text-primary">Welcome to the right tab</p>
			</TabsContent>
		</Tabs>
	);
};

export const LightMode: Story = {
	parameters: {
		backgrounds: {
			default: "light",
		},
	},
	render: Render,
};

export const DarkMode: Story = {
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
