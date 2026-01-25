export const notNullGuard = <T>(item: T | null): item is T => {
	return item !== null;
};
