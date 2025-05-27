"use client";

import FileList from "@/components/drive/FileList";
import { useDriveStore } from "@/stores/drive";

export default function Shared() {
	const { sharedFiles } = useDriveStore();

	return (
		<section>
			<FileList files={sharedFiles} folders={[]} actions={["download"]} />
		</section>
	);
}
