import { ChevronRight, Home } from "lucide-react";

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface CurrentPathProps {
	path: string;
	setPath: (path: string) => void;
}

export default function CurrentPath({ path, setPath }: CurrentPathProps) {
	const folders = path.split("/").filter(Boolean);

	return (
		<Breadcrumb className="py-3">
			<BreadcrumbList className="flex-wrap gap-1">
				<BreadcrumbItem
					className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent cursor-pointer transition-colors"
					onClick={() => setPath("/")}
				>
					<Home className="size-4 text-muted-foreground" />
					<span className="font-medium text-sm">My Files</span>
				</BreadcrumbItem>
				{folders.map((folder, index) => (
					<div key={index} className="flex items-center">
						<BreadcrumbSeparator className="mx-1">
							<ChevronRight className="size-4 text-muted-foreground/50" />
						</BreadcrumbSeparator>
						<BreadcrumbItem
							className="px-2 py-1 rounded-md hover:bg-accent cursor-pointer transition-colors font-medium text-sm"
							onClick={() => setPath("/" + folders.slice(0, index + 1).join("/") + "/")}
						>
							{folder}
						</BreadcrumbItem>
					</div>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
