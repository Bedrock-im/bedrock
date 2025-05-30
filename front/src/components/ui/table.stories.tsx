import { Meta, StoryObj } from "@storybook/nextjs";
import { Download, Trash } from "lucide-react";

import { Table, TableCaption, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

const meta: Meta = {
	component: Table,
	title: "Table",
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
	<Table {...args}>
		<TableCaption>Your files</TableCaption>
		<TableHeader>
			<TableRow>
				<TableHead className="w-[100px]">Name</TableHead>
				<TableHead>Size</TableHead>
				<TableHead>Created At</TableHead>
				<TableHead className="text-right">Actions</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			<TableRow>
				<TableCell className="font-medium">image.png</TableCell>
				<TableCell>3.2 Mo</TableCell>
				<TableCell>Jan 4th 2025</TableCell>
				<TableCell className="flex justify-end gap-2">
					<Download size={16} />
					<Trash size={16} />
				</TableCell>
			</TableRow>
		</TableBody>
	</Table>
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
