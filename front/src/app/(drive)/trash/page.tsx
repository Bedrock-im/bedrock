"use client";

import FileList from "@/components/drive/FileList";

export default function Home() {
	return <FileList emptyMessage="Your trash is empty." trash actions={["download", "hardDelete", "restore"]} />;
}
