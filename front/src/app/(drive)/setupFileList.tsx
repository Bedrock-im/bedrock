"use client";

import { useEffect, useState } from 'react';
import "./drive.css";

import { Permission } from "@/utils/types";
const SetupFileList = () => {
	const [files, setFiles] = useState<{
		name: string; size: number; id: string; createdAt: string; permission: Permission, path: string
	}[]>([]);
	const [folders, setFolders] = useState<{
		name: string; permission: Permission, path: string
	}[]>([]);

	return (
		<div></div>
	)
}

export default SetupFileList;