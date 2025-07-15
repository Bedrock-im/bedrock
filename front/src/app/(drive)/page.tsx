"use client";

import FileList from "@/components/drive/FileList";

export default function Home() {
	return <FileList actions={["upload", "download", "rename", "move", "delete", "share", "duplicate"]} />;
}
