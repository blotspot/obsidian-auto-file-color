import { App, PluginSettingTab, Setting, TextComponent, ButtonComponent, DropdownComponent, ColorComponent } from 'obsidian';
import AutoFileColorPlugin from '../main';
import { RuleType } from '../model/RuleType';
import { ColorRule } from '../model/ColorRule';
import { removeRuleStyles } from 'src/util/helper';

export interface AutoFileColorSettings {
    colorRules: ColorRule[];
}

export const DEFAULT_SETTINGS: AutoFileColorSettings = {
    colorRules: [
        {
            id: 'status-draft',
            value: 'status: draft',
            type: RuleType.Frontmatter,
            color: '#f25c05'
        },
        {
            id: 'status-revised-draft',
            value: 'status: revised draft',
            type: RuleType.Frontmatter,
            color: '#f2b705'
        },
        {
            id: 'status-improvements',
            value: 'status: needs improvements',
            type: RuleType.Frontmatter,
            color: '#618c03'
        },
        {
            id: 'status-postable-draft',
            value: 'status: postable',
            type: RuleType.Frontmatter,
            color: '#71a8d9'
        },
        {
            id: 'status-published',
            value: 'status: published',
            type: RuleType.Frontmatter,
            color: '#c44545'
        }
    ],
}

export class AutoFileColorSettingsTab extends PluginSettingTab {
    plugin: AutoFileColorPlugin;

    constructor(app: App, plugin: AutoFileColorPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h1', { text: 'Auto File Color Settings' });

        // Create a header row
        const headerRow = containerEl.createEl('div', { cls: 'afc-rule-settings-header-row' });

        // Add labels for each column
        headerRow.createEl('span', { text: 'Rule Type', cls: 'afc-rule-settings-column-rule-type' });
        headerRow.createEl('span', { text: 'Value', cls: 'afc-rule-settings-column-rule-value' });
        headerRow.createEl('span', { text: 'Color', cls: 'afc-rule-settings-column-rule-color' });
        headerRow.createEl('span', { text: '', cls: 'afc-rule-settings-column-rule-button' });

        const rulesContainer = containerEl.createEl('div', { cls: 'afc-rules-container' });

        // Display existing rules
        this.plugin.settings.colorRules.forEach((rule, index) => this.addRuleSetting(rulesContainer, rule, index));

        // Add new rule button
        new ButtonComponent(containerEl)
            .setButtonText('Add new rule')
            .onClick(() => {
                const newRule: ColorRule = {
                    id: Date.now().toString(),
                    value: '',
                    type: RuleType.Folder,
                    color: '#000000',
                };
                this.plugin.settings.colorRules.push(newRule);
                this.addRuleSetting(rulesContainer, newRule);
                this.plugin.saveSettings();
            });
    }

    addRuleSetting(
        containerEl: HTMLElement,
        rule: ColorRule,
        index: number = this.plugin.settings.colorRules.length - 1,
    ): void {
        const ruleSettingDiv = containerEl.createEl('div', { cls: 'afc-rule-settings-row' });

        new Setting(ruleSettingDiv)
            .setClass('afc-rule-setting-item')
            .addDropdown((dropdown: DropdownComponent) => {
                dropdown.addOption(RuleType.Folder, 'Folder');
                dropdown.addOption(RuleType.Frontmatter, 'Frontmatter');
                dropdown.setValue(rule.type);
                dropdown.onChange((value) => {
                    rule.type = value as RuleType;
                    this.plugin.saveSettings();
                });
                dropdown.selectEl.classList.add('afc-rule-type-dropdown');
            });

        new Setting(ruleSettingDiv)
            // .setName('Value')
            .setClass('afc-rule-setting-item')
            .addText((text) => {
                text.setPlaceholder('Enter rule value');
                text.setValue(rule.value);
                text.onChange((value) => {
                    rule.value = value;
                    this.plugin.saveSettings();
                });
                text.inputEl.classList.add('afc-rule-value-input');
            });

        const colorSetting = new Setting(ruleSettingDiv)
            .setClass('afc-rule-setting-item');

        const colorInput = new TextComponent(colorSetting.controlEl)
            .setPlaceholder('Enter color hex code')
            .setValue(rule.color);
        colorInput.inputEl.classList.add('afc-rule-setting-item-text-input');

        const picker = new ColorComponent(colorSetting.controlEl)
            .setValue(rule.color)
            .onChange((color) => {
                rule.color = color;
                colorInput.setValue(color);
                this.plugin.saveSettings();
            });

        colorInput.onChange((value: string) => {
            if (/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value)) {
                rule.color = value;
                picker.setValue(value);
                this.plugin.saveSettings();
            }
        });

        new ButtonComponent(ruleSettingDiv)
            .setButtonText('▲')
            .setTooltip('Move Up')
            .setClass('afc-rule-setting-item-up-button')
            .setDisabled(index == 0)
            .onClick(() => {
                if (index > 0) {
                    this.plugin.settings.colorRules.splice(index, 1);
                    this.plugin.settings.colorRules.splice(index - 1, 0, rule);
                    this.plugin.saveSettings();
                    this.display();
                }
            });

        new ButtonComponent(ruleSettingDiv)
            .setButtonText('▼')
            .setTooltip('Move Down')
            .setClass('afc-rule-setting-item-down-button')
            .setDisabled(index == this.plugin.settings.colorRules.length - 1)
            .onClick(() => {
                if (index < this.plugin.settings.colorRules.length - 1) {
                    this.plugin.settings.colorRules.splice(index, 1);
                    this.plugin.settings.colorRules.splice(index + 1, 0, rule);
                    this.plugin.saveSettings();
                    this.display();
                }
            });

        new ButtonComponent(ruleSettingDiv)
            .setButtonText('Remove')
            .setClass('afc-rule-setting-item-remove-button')
            .setCta().onClick(() => {
                this.plugin.settings.colorRules = this.plugin.settings.colorRules.filter((r) => r.id !== rule.id);
                this.plugin.saveSettings();
                removeRuleStyles(rule);
                ruleSettingDiv.remove();
            });
    }
}