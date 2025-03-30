import { View, WorkspaceLeaf } from "obsidian";

// Augmenting the 'obsidian' module
declare module "obsidian" {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface Workspace {
		getLeavesOfType(viewType: "file-explorer"): ExplorerLeaf[];
	}
}

type ExplorerItem = {
	parent: ExplorerItem;
	selfEl: HTMLDivElement;
};

type ExplorerView = {
	fileItems: Record<
		string,
		ExplorerItem
	>;
} & View;

type ExplorerLeaf = {
	view: ExplorerView;
} & WorkspaceLeaf;