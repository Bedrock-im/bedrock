"use client";

import FileList from "@/components/drive/FileList";

export const dynamic = 'force-dynamic';

export default function Home() {
	return <FileList emptyMessage="Your trash is empty." trash actions={["hardDelete", "restore", "bulk"]} />;
}
