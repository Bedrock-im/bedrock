import { create } from "zustand";

import { Contact, FileFullInfos } from "@/services/bedrock";

type DriveStoreState = {
	files: DriveFile[];
	folders: DriveFolder[];
	sharedFiles: DriveFile[];
	contacts: Contact[];
};

export type DriveFile = FileFullInfos & { content?: Buffer };
export type DriveFolder = Omit<DriveFile, "store_hash" | "post_hash" | "size" | "key" | "iv" | "name" | "content">;

type DriveStoreActions = {
	setFiles: (files: DriveFile[]) => void;
	setFolders: (folders: DriveFolder[]) => void;
	setSharedFiles: (sharedFiles: DriveFile[]) => void;
	setContacts: (contacts: Contact[]) => void;
	addFile: (file: DriveFile) => void;
	addFiles: (files: DriveFile[]) => void;
	addFolder: (folder: DriveFolder) => void;
	hardDeleteFile: (path: string) => string | undefined;
	softDeleteFile: (path: string, deletionDate: Date, newPath?: string) => DriveFile | undefined;
	hardDeleteFolder: (path: string) => DriveFile[];
	softDeleteFolder: (path: string, deletionDate: Date, newPath?: string) => DriveFile[];
	restoreFile: (path: string) => string | undefined;
	moveFile: (oldPath: string, newPath: string) => void;
	moveFolder: (oldPath: string, newPath: string) => [DriveFile, DriveFile][];
	updateFileContent: (path: string, newContent: Buffer) => Buffer | undefined;
};

export const useDriveStore = create<DriveStoreState & DriveStoreActions>((set, getState) => ({
	files: [],
	folders: [],
	sharedFiles: [],
	contacts: [],
	setFiles: (files) => set({ files }),
	setFolders: (folders) => set({ folders }),
	setSharedFiles: (sharedFiles) => set({ sharedFiles }),
	setContacts: (contacts) => set({ contacts }),
	addFile: (file) => set((state) => ({ files: [...state.files, file] })),
	addFiles: (files) => set((state) => ({ files: [...state.files, ...files] })),
	addFolder: (folder) => set((state) => ({ folders: [...state.folders, folder] })),
	hardDeleteFile: (path) => {
		const storeHash = getState().files.find((file) => file.path === path)?.store_hash;
		set((state) => ({ files: state.files.filter((file) => file.path !== path) }));
		return storeHash;
	},
	softDeleteFile: (path, deletionDate, newPath?: string) => {
		const fileToDelete = getState().files.find((file) => file.path === path);
		set((state) => ({
			files: state.files.map((file) =>
				file.path === path
					? {
							...file,
							content: undefined,
							deleted_at: deletionDate.toISOString(),
							path: newPath ? newPath : file.path,
						}
					: file,
			),
		}));
		return fileToDelete;
	},
	hardDeleteFolder: (path) => {
		const filesToDelete = getState().files.filter((file) => file.path.startsWith(path));
		set((state) => ({
			folders: state.folders.filter((folder) => !folder.path.startsWith(path)),
			files: state.files.filter((file) => !file.path.startsWith(path)),
		}));
		return filesToDelete;
	},
	softDeleteFolder: (path, deletionDate, newPath?: string) => {
		const filesToDelete = getState().files.filter((file) => file.path.startsWith(path));
		set((state) => ({
			folders: state.folders.map((folder) =>
				folder.path.startsWith(path)
					? {
							...folder,
							deleted_at: deletionDate.toISOString(),
							path: newPath ? newPath + "/" + folder.path.slice(path.length) : folder.path,
						}
					: folder,
			),
			files: state.files.map((file) =>
				file.path.startsWith(path)
					? {
							...file,
							content: undefined,
							deleted_at: deletionDate.toISOString(),
							path: newPath ? newPath + "/" + file.name : file.path,
						}
					: file,
			),
		}));
		return filesToDelete;
	},
	restoreFile: (path) => {
		const hash = getState().files.find((file) => file.path === path)?.post_hash;
		set((state) => ({
			files: state.files.map((file) =>
				file.path === path
					? {
							...file,
							deleted_at: null,
						}
					: file,
			),
		}));
		return hash;
	},
	moveFile: (oldPath, newPath) =>
		set((state) => ({
			files: state.files.map((file) =>
				file.path === oldPath
					? {
							...file,
							path: newPath,
						}
					: file,
			),
		})),
	moveFolder: (oldPath, newPath) => {
		const filesToMove = getState().files.filter((file) => file.path.startsWith(oldPath));
		set((state) => ({
			folders: state.folders.map((folder) =>
				folder.path.startsWith(oldPath)
					? {
							...folder,
							path: newPath + folder.path.slice(oldPath.length),
						}
					: folder,
			),
			files: state.files.map((file) =>
				file.path.startsWith(oldPath)
					? {
							...file,
							path: newPath + file.path.slice(oldPath.length),
						}
					: file,
			),
		}));
		return filesToMove.map((file) => [file, { ...file, path: newPath + file.path.slice(oldPath.length) }] as const);
	},
	updateFileContent: (path, newContent) => {
		const file = getState().files.find((file) => file.path === path);
		if (!file) return undefined;
		set((state) => ({
			files: state.files.map((f) =>
				f.path === path
					? {
							...f,
							content: newContent,
						}
					: f,
			),
		}));
		return newContent;
	},
}));
