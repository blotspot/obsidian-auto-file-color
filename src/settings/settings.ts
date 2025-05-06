import {
	App,
	PluginSettingTab,
	Setting,
	TextComponent,
	ColorComponent,
	ButtonComponent,
	ExtraButtonComponent,
} from "obsidian";
import AutoFileColorPlugin from "src/main";
import { RuleType } from "src/model/RuleType";
import { ColorRule } from "src/model/ColorRule";
import { removeRuleStyles } from "src/util/helper";

export class AutoFileColorSettingsTab extends PluginSettingTab {
	plugin: AutoFileColorPlugin;

	constructor(app: App, plugin: AutoFileColorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Notes Folder only")
			.setDesc("Settings affect only default Folder for new notes.")
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.onlyMainFolder).onChange(async val => {
					this.plugin.settings.onlyMainFolder = val;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName("Rules")
			.setDesc("Define all the rules for coloring files.")
			.addButton(button =>
				button.setButtonText("Add folder rule").onClick(() => {
					const newRule: ColorRule = {
						id: Date.now().toString(),
						key: "",
						value: "",
						type: RuleType.Folder,
						color: "",
					};
					this.plugin.settings.colorRules.push(newRule);
					this.addRuleSetting(rulesContainer, newRule);
					this.plugin.saveSettings();
				}),
			)
			.addButton(button =>
				button.setButtonText("Add frontmatter rule").onClick(() => {
					const newRule: ColorRule = {
						id: Date.now().toString(),
						key: "",
						value: "",
						type: RuleType.Frontmatter,
						color: "",
					};
					this.plugin.settings.colorRules.push(newRule);
					this.addRuleSetting(rulesContainer, newRule);
					this.plugin.saveSettings();
				}),
			);

		const rulesContainer = containerEl.createEl("div", {
			cls: "afc-rules-container",
		});

		// Display existing rules
		this.plugin.settings.colorRules.forEach((rule, index) => this.addRuleSetting(rulesContainer, rule, index));
	}

	private addLabelInput(
		row: HTMLElement,
		lb: (label: HTMLLabelElement) => void,
		cb: (text: TextComponent) => void,
	): void {
		const container = row.createDiv({
			cls: "afc-rules-label-input-container",
		});

		const label = container.createEl("label");
		container.append(label);

		lb(label);
		cb(new TextComponent(container));
	}

	private addRuleSetting(
		containerEl: HTMLElement,
		rule: ColorRule,
		index: number = this.plugin.settings.colorRules.length - 1,
	): void {
		const row = new Setting(containerEl);

		const btnGroup = createDiv({ cls: "afc-mv-button-group" });
		const inputContainer = createDiv({ cls: "afc-settings-row", parent: row.controlEl });
		const keyValueDiv = createDiv({ cls: "afc-settings-row-group", parent: inputContainer });

		if (rule.type === RuleType.Frontmatter) {
			row.setName(`#${index} Frontmatter Rule`);
			row.setDesc("Key and value of frontmatter property");
			this.addLabelInput(
				keyValueDiv,
				label => {
					label.setText("Key");
				},
				text => {
					text.setPlaceholder("Enter frontmatter key");
					text.inputEl.classList.add("afc-setting-key-input");
					text.setValue(rule.key);
					text.onChange(value => {
						rule.key = value;
						this.plugin.saveSettings();
					});
				},
			);
			this.addLabelInput(
				keyValueDiv,
				label => {
					label.setText("Value");
				},
				text => {
					text.setPlaceholder("Enter frontmatter value");
					text.inputEl.classList.add("afc-setting-value-input");
					text.setValue(rule.value);
					text.onChange(value => {
						rule.value = value;
						this.plugin.saveSettings();
					});
				},
			);
		} else {
			row.setName("#" + index + " File Rule");
			row.setDesc("File- or foldername");
			this.addLabelInput(
				keyValueDiv,
				label => {
					label.setText("Folder name");
				},
				text => {
					text.setPlaceholder("Enter folder name");
					text.inputEl.classList.add("afc-setting-value-input");
					text.setValue(rule.value);
					text.onChange(value => {
						rule.value = value;
						this.plugin.saveSettings();
					});
				},
			);
		}

		const colorGroup = createDiv({ cls: "afc-settings-row-group", parent: inputContainer });
		let colorInput: TextComponent;
		let colorPicker: ColorComponent;

		this.addLabelInput(
			colorGroup,
			label => {
				label.setText("Color");
			},
			text => {
				colorInput = text;
				text.setPlaceholder("Enter color hex code");
				text.setValue(rule.color);
				text.inputEl.classList.add("afc-setting-color-input");
				text.onChange((value: string) => {
					if (/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value)) {
						rule.color = value;
						colorPicker.setValue(value);
						this.plugin.saveSettings();
					}
				});
			},
		);

		colorPicker = new ColorComponent(colorGroup);
		colorPicker.setValue(rule.color);
		colorPicker.onChange(color => {
			rule.color = color;
			colorInput.setValue(color);
			this.plugin.saveSettings();
		});

		row.settingEl.prepend(btnGroup);

		const mvUpBtn = new ExtraButtonComponent(btnGroup);
		mvUpBtn.setIcon("chevron-up");
		mvUpBtn.setTooltip("Move Up");
		mvUpBtn.setDisabled(index == 0);
		mvUpBtn.onClick(() => {
			if (index > 0) {
				this.plugin.settings.colorRules.splice(index, 1);
				this.plugin.settings.colorRules.splice(index - 1, 0, rule);
				this.plugin.saveSettings();
				this.display();
			}
		});

		const mvDownBtn = new ExtraButtonComponent(btnGroup);
		mvDownBtn.setIcon("chevron-down");
		mvDownBtn.setTooltip("Move Down");
		mvDownBtn.setDisabled(index == this.plugin.settings.colorRules.length - 1);
		mvDownBtn.onClick(() => {
			if (index < this.plugin.settings.colorRules.length - 1) {
				this.plugin.settings.colorRules.splice(index, 1);
				this.plugin.settings.colorRules.splice(index + 1, 0, rule);
				this.plugin.saveSettings();
				this.display();
			}
		});

		row.addExtraButton(rmBtn => {
			rmBtn.setIcon("x");
			rmBtn.setTooltip("Remove");
			rmBtn.onClick(() => {
				this.plugin.settings.colorRules = this.plugin.settings.colorRules.filter(r => r.id !== rule.id);
				this.plugin.saveSettings();
				removeRuleStyles(rule);
				row.settingEl.remove();
			});
		});
	}
}
