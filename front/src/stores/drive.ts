import { create } from "zustand";

import { FileFullInfos } from "@/services/bedrock";

type DriveStoreState = {
	files: DriveFile[];
	folders: DriveFolder[];
};

export type DriveFile = Omit<FileFullInfos, "post_hash" | "key" | "iv">;
export type DriveFolder = Omit<DriveFile, "store_hash" | "size">;

type DriveStoreActions = {
	currentWorkingDirectory: string;
	setFiles: (files: DriveFile[]) => void;
	setFolders: (folders: DriveFolder[]) => void;
	addFile: (file: DriveFile) => void;
	addFiles: (files: DriveFile[]) => void;
	addFolder: (folder: DriveFolder) => void;
	deleteFile: (id: string) => string | undefined;
	deleteFolder: (path: string) => DriveFile[];
	moveFile: (oldPath: string, newPath: string) => void;
	moveFolder: (oldPath: string, newPath: string) => [DriveFile, DriveFile][];
	changeCurrentWorkingDirectory: (newDirectory: string) => void;
};

export const useDriveStore = create<DriveStoreState & DriveStoreActions>((set, getState) => ({
	files: [],
	folders: [],
	setFiles: (files) => set({ files }),
	setFolders: (folders) => set({ folders }),
	addFile: (file) => set((state) => ({ files: [...state.files, file] })),
	addFiles: (files) => set((state) => ({ files: [...state.files, ...files] })),
	addFolder: (folder) => set((state) => ({ folders: [...state.folders, folder] })),
	deleteFile: (path) => {
		const storeHash = getState().files.find((file) => file.path === path)?.store_hash;
		set((state) => ({ files: state.files.filter((file) => file.path !== path) }));
		return storeHash;
	},
	deleteFolder: (path) => {
		const filesToDelete = getState().files.filter((file) => file.path.startsWith(path));
		set((state) => ({
			folders: state.folders.filter((folder) => !folder.path.startsWith(path)),
			files: state.files.filter((file) => !file.path.startsWith(path)),
		}));
		return filesToDelete;
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
	currentWorkingDirectory: "/",
	changeCurrentWorkingDirectory: (newDirectory) =>
		set({ currentWorkingDirectory: newDirectory.endsWith("/") ? newDirectory : newDirectory + "/" }),
}));
