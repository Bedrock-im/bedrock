import { Meta, StoryObj } from "@storybook/react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const meta: Meta = {
	component: ScrollArea,
	title: "Scroll Area",
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
type DarkModeMeta = { dark?: boolean; className?: string };

const versions = Array.from({ length: 22 }).map((_, i, a) => `v1.${a.length - i - 1}`);

const Render = (args: DarkModeMeta) => (
	<ScrollArea {...args} className={cn("h-72 w-48 rounded-md border", args.className)}>
		<div className="p-4">
			<h4 className="mb-4 text-sm font-medium leading-none text-primary">Versions</h4>
			{versions.map((version) => (
				<>
					<div key={version} className="text-sm text-primary">
						{version}
					</div>
					<Separator orientation="horizontal" className="my-2" />
				</>
			))}
		</div>
	</ScrollArea>
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
