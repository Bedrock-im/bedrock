import React, { useState } from 'react';

import "@/app/(drive)/drive.css";
import { FileListProps } from "@/utils/types";
import { Card, CardFooter, CardTitle, CardContent } from "@/components/ui/card";
import { FolderIcon, FileText } from "lucide-react";

type SortColumn = 'name' | 'size' | 'createdAt' | 'permission';
type SortOrder = 'asc' | 'desc';

const FileList: React.FC<FileListProps> = ({ files, folders }) => {
	const [sortColumn, setSortColumn] = useState<SortColumn>('name');
	const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

	return (
		<div></div>
	)
}

export default FileList;