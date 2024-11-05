"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import useBedrockFileUploadDropzone from "@/hooks/useBedrockFileUploadDropzone";
import { useBedrockAccountStore } from "@/stores/bedrockAccount";

export default function Home() {
	const { bedrockService } = useBedrockAccountStore();
	const { getInputProps, getRootProps } = useBedrockFileUploadDropzone({
		current_directory: "/",
		bedrockService: bedrockService!,
	});

	return (
		<section className="h-full">
			<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
				<div className="flex items-center gap-2 px-4">
					<SidebarTrigger className="-ml-1" />
				</div>
			</header>
			<div className="h-full" {...getRootProps()}>
				<input {...getInputProps()} />
				<p>Upload files here</p>
			</div>
		</section>
	);
}
