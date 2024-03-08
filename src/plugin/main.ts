import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, debounce } from 'obsidian';
import { AutoFileColorSettings, AutoFileColorSettingsTab, DEFAULT_SETTINGS } from './settings';
import { ColorRule } from '../model/ColorRule'
import { RuleType } from 'src/model/RuleType';

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
			this.removeStyle(rule);
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.updateStyles();
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.updateStyles();
	}

	async updateStyles() {
		this.settings.colorRules.forEach((rule) => this.updateStyle(rule));
	}

	async updateStyle(rule: ColorRule) {
		const styleName = this.makeStyleName(rule);
		this.updateCustomCSS(styleName, `
			.${styleName} {
				background-color: color-mix(in srgb, ${rule.color} 15%, transparent);
			}
		`);
	}

	addCustomCSS(cssstylename: string, css: string) {
		const styleElement = document.createElement('style');
		styleElement.id = cssstylename;
		styleElement.innerText = css;
		document.head.appendChild(styleElement);
	}

	updateCustomCSS(cssstylename: string, css: string) {
		const styleElement = document.getElementById(cssstylename);
		if (styleElement) {
			styleElement.innerText = css;
		} else {
			this.addCustomCSS(cssstylename, css);
		}
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
			this.highlightNote(el, rule);
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

	highlightNote(element: Element, rule: ColorRule) {
		element.classList.add(this.makeStyleName(rule));
	}

	unhighlightNote(element: Element) {
		this.settings.colorRules.forEach((rule) => {
			element.classList.remove(this.makeStyleName(rule));
		});
	}

	async removeStyle(rule: ColorRule) {
		const style = this.makeStyleName(rule);
		const styleElement = document.getElementById(style);
		if (styleElement) {
			styleElement.remove();
		}
	}

	makeStyleName(rule: ColorRule): string {
		return `afc-${rule.id}-style`;
	}
}
