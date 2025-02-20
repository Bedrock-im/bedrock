import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface CurrentPathProps {
	path: string;
	setPath: (path: string) => void;
}

export default function CurrentPath({ path, setPath }: CurrentPathProps) {
	const folders = path.split("/").filter(Boolean);

	return (
		<Breadcrumb className="py-2">
			<BreadcrumbList>
				<BreadcrumbItem className="hover:cursor-pointer hover:text-primary" onClick={() => setPath("/")}>
					My files
				</BreadcrumbItem>
				{folders.map((folder, index) => (
					<div
						key={index}
						className="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5"
					>
						<BreadcrumbSeparator />
						<BreadcrumbItem
							className="hover:cursor-pointer hover:text-primary"
							onClick={() => setPath("/" + folders.slice(0, index + 1).join("/"))}
						>
							{folder}
						</BreadcrumbItem>
					</div>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
