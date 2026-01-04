"use client";

import FileList from "@/components/drive/FileList";

export const dynamic = "force-dynamic";

export default function Home() {
	return (
		<FileList
			emptyMessage="Your drive is empty."
			actions={["upload", "download", "rename", "move", "delete", "share", "duplicate", "copy", "bulk"]}
		/>
	);
}
