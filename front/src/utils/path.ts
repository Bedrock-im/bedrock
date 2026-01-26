export const normalizePath = (path: string): string => {
	let normalized = path.startsWith("/") ? path : "/" + path;
	normalized = normalized.endsWith("/") ? normalized : normalized + "/";
	return normalized.replace(/\/+/g, "/");
};

export const joinPath = (directory: string, filename: string): string => {
	const normalizedDir = normalizePath(directory);
	return normalizedDir + filename;
};

export const getParentPath = (path: string): string => {
	const normalized = normalizePath(path);
	const parts = normalized.split("/").filter(Boolean);
	if (parts.length === 0) return "/";
	return "/" + parts.slice(0, -1).join("/") + (parts.length > 1 ? "/" : "");
};

export const getFilename = (path: string): string => {
	return path.split("/").filter(Boolean).pop() || "";
};

export const getDestinationParent = (newPath: string): string => {
	const parts = newPath.split("/").filter(Boolean);
	if (parts.length <= 1) return "/";
	return "/" + parts.slice(0, -1).join("/") + "/";
};
