import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, debounce } from 'obsidian';
import { AutoFileColorSettings, AutoFileColorSettingsTab, DEFAULT_SETTINGS } from 'src/settings/settings';
import { ColorRule } from 'src/model/ColorRule'
import { RuleType } from 'src/model/RuleType';
import { addCustomClasses, removeCustomClasses, removeRuleStyles, updateRuleStyle } from 'src/util/helper';

export default class AutoFileColorPlugin extends Plugin {
	settings: AutoFileColorSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new AutoFileColorSettingsTab(this.app, this));
		this.registerEvent(this.app.workspace.on('layout-change', () => this.applyColorStyles()));
		this.app.workspace.onLayoutReady(async () => this.applyColorStyles());
	}

	onunload() {
		// cleanup all custom styles
		this.settings.colorRules.forEach((rule) => {
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
		this.settings.colorRules.forEach((rule) => updateRuleStyle(rule));
	}

	applyColorStyles = debounce(this.applyColorStylesInternal, 50, true);

	private applyColorStylesInternal() {
		const fileExplorers = this.app.workspace.getLeavesOfType('file-explorer')
		fileExplorers.forEach((fileExplorer) => {
			Object.entries(fileExplorer.view.fileItems).forEach(
				([path, fileItem]) => {
					this.applyRules(path, fileItem.el);
				}
			)
		})
	}

	private applyRules(path: string, el: HTMLDivElement) {
		const rule = this.settings.colorRules.find((rule) => this.ruleApplies(rule, path));

		if (rule) {
			addCustomClasses(el, rule);
		}
	}

	private ruleApplies(rule: ColorRule, path: string): boolean {
		return (rule.type === RuleType.Folder && this.checkPath(path, rule.value)) ||
			(rule.type === RuleType.Frontmatter && this.checkFrontMatter(path, rule.value));
	}

	private checkPath(currentPath: string, folder: string): boolean {
		const parts = currentPath.split(/[/\\]/);
		return parts.includes(folder);
	}

	private checkFrontMatter(currentPath: string, ruleValue: string): boolean {
		const [key, value] = ruleValue.split(":", 2);
		const frontMatterValue = this.app.metadataCache.getCache(currentPath)?.frontmatter?.[key.trim()];
		const normalizedFrontMatterValue = frontMatterValue?.toString().toLowerCase().trim();
		const normalizedValueToHighlight = value?.toString().toLowerCase().trim();

		return normalizedFrontMatterValue === normalizedValueToHighlight;
	}

	unhighlightFiles(element: Element) {
		this.settings.colorRules.forEach((rule) => removeCustomClasses(element, rule));
	}
}
