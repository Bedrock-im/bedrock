"use client";

import FileList from "@/components/drive/FileList";

export default function Home() {
	return <FileList trash actions={["download", "hardDelete", "restore"]} />;
}
