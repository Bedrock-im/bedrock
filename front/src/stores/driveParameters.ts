import { create } from "zustand";

import { DirectoryPath } from "@/services/bedrock";

type DriveParametersState = {
	currentDirectoryPath: DirectoryPath;
};

type DriveParametersAction = {
	setCurrentDirectory: (path: string) => void;
};

function isDirectoryPath(path: string): path is DirectoryPath {
	return path === "/" || /^\/[A-Za-z0-9-_+.]+\/$/.test(path);
}

export const useDriveParametersStore = create<DriveParametersState & DriveParametersAction>((set) => ({
	currentDirectoryPath: "/",
	setCurrentDirectory(path) {
		if (isDirectoryPath(path)) set({ currentDirectoryPath: path });
		else throw new Error("Invalid directory path");
	},
}));
