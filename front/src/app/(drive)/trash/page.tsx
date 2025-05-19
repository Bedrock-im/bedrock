"use client";

import FileList from "@/components/drive/FileList";

export default function Home() {
	return <FileList actions={["download", "hardDelete", "restore"]} />;
}
