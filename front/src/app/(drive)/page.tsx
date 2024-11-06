"use client";

import { useCallback } from "react"; /*TODO: REMOVE TESTING AFTER REVIEW*/

import { SidebarTrigger } from "@/components/ui/sidebar";
import useBedrockFileUploadDropzone from "@/hooks/useBedrockFileUploadDropzone";
import { useBedrockAccountStore } from "@/stores/bedrockAccount";

export default function Home() {
	const { bedrockService } = useBedrockAccountStore();
	const { getInputProps, getRootProps } = useBedrockFileUploadDropzone({
		current_directory: "/",
		bedrockService: bedrockService!,
	});

	const onFetch = useCallback(async () => {
		/*TODO: REMOVE TESTING AFTER REVIEW*/
		if (bedrockService === null) return;
		console.log("fileEntries", await bedrockService!.fetchFileEntries());
	}, [bedrockService]);

	return (
		<section className="h-full">
			<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
				<div className="flex items-center gap-2 px-4">
					<SidebarTrigger className="-ml-1" />
				</div>
			</header>
			<button onClick={onFetch}>Log fetched file entries</button> {/*TODO: REMOVE TESTING AFTER REVIEW*/}
			<div className="h-full" {...getRootProps()}>
				{/*TODO: REMOVE TESTING AFTER REVIEW*/}
				<input {...getInputProps()} />
				<p>Upload files here</p>
			</div>
		</section>
	);
}
