export type DriveContent = {
	name: string;
	path: string;
	createdAt: string;
	deletedAt: string | null;
	permission: Permission;
};

export type DriveFileProps = DriveContent & {
	type: "file";
	id: string;
	size: number;
};

export type DriveFolderProps = DriveContent & {
	type: "folder";
};

export type FileListProps = {
	files: DriveFileProps[];
	folders: DriveFolderProps[];
};

export type Permission = "owner" | "editor" | "viewer";
