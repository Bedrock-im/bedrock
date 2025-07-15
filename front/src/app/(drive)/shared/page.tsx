"use client";

import FileList from "@/components/drive/FileList";
import { useDriveStore } from "@/stores/drive";

export default function Shared() {
	const { sharedFiles } = useDriveStore();

	return (
		<section>
			<FileList emptyMessage="You have no shared files." files={sharedFiles} folders={[]} actions={["download"]} />
		</section>
	);
}
