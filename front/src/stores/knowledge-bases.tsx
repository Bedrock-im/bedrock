import { create } from "zustand";

export type KnowledgeBase = {
	name: string;
	filePaths: string[];
	created_at: Date;
	updated_at: Date;
};

type KnowledgeBaseStoreState = {
	knowledgeBases: KnowledgeBase[];
};

type KnowledgeBaseStoreActions = {
	setKnowledgeBases: (knowledgeBases: KnowledgeBase[]) => void;
	addKnowledgeBase: (knowledgeBase: KnowledgeBase) => void;
	removeKnowledgeBase: (knowledgeBaseName: string) => void;
	renameKnowledgeBase: (oldName: string, newName: string) => void;
	setKnowledgeBaseFiles: (knowledgeBaseName: string, ...filePaths: string[]) => void;
	addFilesToKnowledgeBase: (knowledgeBaseName: string, ...filePaths: string[]) => void;
	removeFilesFromKnowledgeBase: (knowledgeBaseName: string, ...filePaths: string[]) => void;
};

export const useKnowledgeBaseStore = create<KnowledgeBaseStoreState & KnowledgeBaseStoreActions>((set) => ({
	knowledgeBases: [
		{
			name: "My Knowledge Base",
			filePaths: ["/MNGLCUSTOM.zip"],
			created_at: new Date(),
			updated_at: new Date(),
		},
		{
			name: "My Knowledge Base 2",
			filePaths: ["/MNGLCUSTOM.zip"],
			created_at: new Date(),
			updated_at: new Date(),
		},
		{
			name: "My Knowledge Base 3",
			filePaths: ["/MNGLCUSTOM.zip"],
			created_at: new Date(),
			updated_at: new Date(),
		},
	],
	setKnowledgeBases: (knowledgeBases) => set({ knowledgeBases }),
	addKnowledgeBase: (knowledgeBase) => {
		// First check for duplicate outside of set to throw exception
		const state = useKnowledgeBaseStore.getState();
		const nameExists = state.knowledgeBases.some((kb) => kb.name === knowledgeBase.name);
		if (nameExists) {
			throw new Error(`A knowledge base with name "${knowledgeBase.name}" already exists`);
		}
		set((state) => ({ knowledgeBases: [...state.knowledgeBases, knowledgeBase] }));
	},
	removeKnowledgeBase: (knowledgeBaseName) =>
		set((state) => ({ knowledgeBases: state.knowledgeBases.filter((kb) => kb.name !== knowledgeBaseName) })),
	renameKnowledgeBase: (oldName, newName) => {
		// Skip if names are the same
		if (oldName === newName) return;

		// First check for duplicate outside of set to throw exception
		const state = useKnowledgeBaseStore.getState();
		const nameExists = state.knowledgeBases.some((kb) => kb.name === newName);
		if (nameExists) {
			throw new Error(`A knowledge base with name "${newName}" already exists`);
		}

		set((state) => ({
			knowledgeBases: state.knowledgeBases.map((kb) => (kb.name === oldName ? { ...kb, name: newName } : kb)),
		}));
	},
	setKnowledgeBaseFiles: (knowledgeBaseName, ...filePaths) =>
		set((state) => ({
			knowledgeBases: state.knowledgeBases.map((kb) => (kb.name === knowledgeBaseName ? { ...kb, filePaths } : kb)),
		})),
	addFilesToKnowledgeBase: (knowledgeBaseName, ...filePaths) =>
		set((state) => ({
			knowledgeBases: state.knowledgeBases.map((kb) =>
				kb.name === knowledgeBaseName ? { ...kb, filePaths: [...kb.filePaths, ...filePaths] } : kb,
			),
		})),
	removeFilesFromKnowledgeBase: (knowledgeBaseName, ...filePaths) =>
		set((state) => ({
			knowledgeBases: state.knowledgeBases.map((kb) =>
				kb.name === knowledgeBaseName
					? { ...kb, filePaths: kb.filePaths.filter((filePath) => !filePaths.includes(filePath)) }
					: kb,
			),
		})),
}));
