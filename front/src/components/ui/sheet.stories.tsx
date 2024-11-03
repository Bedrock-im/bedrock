import { Meta, StoryObj } from "@storybook/react";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetContentProps,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

const meta: Meta<SheetContentProps> = {
	component: Sheet,
	title: "Sheet",
	args: {
		side: "right",
		className: "",
	},
	argTypes: {
		side: {
			type: "string",
			control: "select",
			options: ["top", "right", "bottom", "left"],
		},
		className: {
			type: "string",
			control: "text",
		},
	},
};
type Story = StoryObj<SheetContentProps>;
type DarkModeMeta = SheetContentProps & { dark?: boolean };

const Render = (args: DarkModeMeta) => (
	<Sheet>
		<SheetTrigger asChild>
			<Button variant="outline">Open</Button>
		</SheetTrigger>
		<SheetContent {...args} className={args.dark ? `${args.className} dark` : args.className}>
			<SheetHeader>
				<SheetTitle>Bedrock</SheetTitle>
				<SheetDescription>Welcome to your brand new drawer.</SheetDescription>
			</SheetHeader>
			<SheetFooter>
				<SheetClose asChild>
					<Button>Close</Button>
				</SheetClose>
			</SheetFooter>
		</SheetContent>
	</Sheet>
);

export const Default: Story = {
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
			<Render {...args} dark />
		</div>
	),
};

export default meta;
