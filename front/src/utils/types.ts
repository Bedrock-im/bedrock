export type DriveFileProps = {
	id: string;
	name: string;
	size: number;
	createdAt: string;
	path: string;
	permission: Permission;
};

export type DriveFolderProps = {
	name: string;
	path: string;
	permission: Permission;
};

export type FileListProps = {
	files: DriveFileProps[];
	folders: DriveFolderProps[];
};

export type Permission = 'owner' | 'viewer' | 'editor';