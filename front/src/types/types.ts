export type DriveFileProps = {
	id: string;
	name: string;
	size: number;
	createdAt: string;
	permission: Permission;
};

export type DriveFolderProps = {
	name: string;
	permission: Permission;
};

export type FileListProps = {
	files: DriveFileProps[];
	folders: DriveFolderProps[];
};

export type Permission = 'owner' | 'viewer' | 'editor';