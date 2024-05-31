import { Plugin, debounce } from "obsidian";
import { AutoFileColorSettingsTab } from "src/settings/settings";
import { AutoFileColorSettings, DEFAULT_SETTINGS } from "src/settings/settings-data";
import { ColorRule } from "src/model/ColorRule";
import { RuleType } from "src/model/RuleType";
import { addCustomClasses, removeCustomClasses, removeRuleStyles, updateRuleStyle } from "src/util/helper";

export default class AutoFileColorPlugin extends Plugin {
	settings: AutoFileColorSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new AutoFileColorSettingsTab(this.app, this));
		this.registerEvent(this.app.workspace.on("layout-change", () => this.colorFiles()));
		this.registerEvent(this.app.metadataCache.on("changed", () => this.colorFiles()));
		this.registerEvent(this.app.vault.on("rename", () => this.colorFiles()));
		this.app.workspace.onLayoutReady(async () => this.colorFiles());
	}

	onunload() {
		// cleanup all custom styles
		this.settings.colorRules.forEach(rule => {
			removeRuleStyles(rule);
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.updateRuleStyles();
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.updateRuleStyles();
	}

	async updateRuleStyles() {
		this.settings.colorRules.forEach(rule => updateRuleStyle(rule));
	}

	colorFiles = debounce(this.colorFilesInternal, 50, true);

	private colorFilesInternal() {
		this.app.workspace.getLeavesOfType("file-explorer").forEach(fileExplorer => {
			Object.entries(fileExplorer.view.fileItems).forEach(([path, fileItem]) => {
				this.applyRules(path, fileItem.selfEl);
			});
		});
	}

	private applyRules(path: string, el: HTMLDivElement) {
		this.settings.colorRules.forEach(rule => {
			removeCustomClasses(el, rule);
			if (this.doesRuleApply(rule, path)) {
				addCustomClasses(el, rule);
			}
		});
	}

	private doesRuleApply(rule: ColorRule, path: string): boolean {
		return (
			(rule.type === RuleType.Folder && this.checkIfFolderRuleApplies(path, rule.value)) ||
			(rule.type === RuleType.Frontmatter && this.checkIfFrontmatterRuleApplies(path, rule.key, rule.value))
		);
	}

	private checkIfFolderRuleApplies(currentPath: string, folder: string): boolean {
		const parts = currentPath.split(/[/\\]/);
		return parts.includes(folder);
	}

	private checkIfFrontmatterRuleApplies(currentPath: string, key: string, value: string): boolean {
		const frontMatterValue = this.app.metadataCache.getCache(currentPath)?.frontmatter?.[key.trim()];
		const normalizedFrontMatterValue = frontMatterValue?.toString().toLowerCase().trim();
		const normalizedValueToHighlight = value?.toString().toLowerCase().trim();

		return normalizedFrontMatterValue === normalizedValueToHighlight;
	}
}
