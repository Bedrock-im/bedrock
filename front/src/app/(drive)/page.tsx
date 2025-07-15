"use client";

import FileList from "@/components/drive/FileList";

export default function Home() {
	return <FileList emptyMessage="Your drive is empty." actions={["upload", "download", "rename", "move", "delete", "share"]} />;
}
