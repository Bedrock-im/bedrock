import { Meta, StoryObj } from "@storybook/nextjs";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

const meta: Meta = {
	component: Toaster,
	title: "Sonner",
};
type Story = StoryObj;

const Render = () => {
	return (
		<>
			<Toaster />
			<Button
				variant="outline"
				onClick={() =>
					toast("File has been created", {
						description: "file.pdf",
						action: {
							label: "Navigate to file",
							onClick: () => {},
						},
						cancel: {
							label: "Undo",
							onClick: () => {},
						},
					})
				}
			>
				Open toaster
			</Button>
		</>
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
