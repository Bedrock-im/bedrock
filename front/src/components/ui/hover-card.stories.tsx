import { Meta, StoryObj } from "@storybook/react";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const meta: Meta = {
	component: HoverCard,
	title: "Hover Card",
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

const Render = (args: DarkModeMeta) => (
	<HoverCard>
		<HoverCardTrigger asChild>
			<Button variant="link">Bedrock</Button>
		</HoverCardTrigger>
		<HoverCardContent className={args.dark ? "dark w-80" : "w-80"}>
			<div className="flex justify-between space-x-4">
				<div className="space-y-1">
					<h4 className="text-sm font-semibold">Bedrock</h4>
					<p className="text-sm">Your decentralized workspace by design, not by promise.</p>
					<div className="flex items-center pt-2">
						<CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
						<span className="text-xs text-muted-foreground">Since June 2024</span>
					</div>
				</div>
			</div>
		</HoverCardContent>
	</HoverCard>
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
			<Render {...args} dark />
		</div>
	),
};

export default meta;
