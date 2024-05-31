import { View, WorkspaceLeaf } from "obsidian";

// Augmenting the 'obsidian' module
declare module "obsidian" {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface Workspace {
		getLeavesOfType(viewType: "file-explorer"): ExplorerLeaf[];
	}
}

type ExplorerView = {
	fileItems: Record<
		string,
		{
			selfEl: HTMLDivElement;
			el: HTMLDivElement;
		}
	>;
} & View;

type ExplorerLeaf = {
	view: ExplorerView;
} & WorkspaceLeaf;
