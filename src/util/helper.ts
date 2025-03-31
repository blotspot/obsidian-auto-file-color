import { FileSystemAdapter, Vault } from "obsidian";
import { ExplorerItem } from "src/global";
import { ColorRule } from "src/model/ColorRule";

export const updateRuleStyle = async (rule: ColorRule) => {
	const styleName = makeStyleName(rule);
	updateCustomCSS(
		styleName,
		`
		.${styleName} {
			background-color: color-mix(in srgb, ${rule.color} 33%, transparent);
			border-color: color-mix(in srgb, ${rule.color} 33%, transparent);
		}
	`,
	);
};

export const removeRuleStyles = async (rule: ColorRule) => {
	const style = makeStyleName(rule);
	const styleElement = document.getElementById(style);
	if (styleElement) {
		styleElement.remove();
	}
};

export const addCustomClasses = (item: ExplorerItem, rule: ColorRule) => {
	// check for folder note plugin css class
	if (item.selfEl.classList.contains("is-folder-note")) {
		item = item.parent;
	}
	item.selfEl.classList.add(makeStyleName(rule));
};

export const removeCustomClasses = (element: Element, rule: ColorRule) => {
	element.classList.remove(makeStyleName(rule));
};

export const getMainFolder = (vault: Vault) => {
	let path = "";
	const adapter = vault.adapter;
	if (adapter instanceof FileSystemAdapter) {
		path = adapter.getBasePath();
	}
	return path + "/" + vault.configDir;
};

const addCustomCSS = (cssStyleName: string, css: string) => {
	const styleElement = document.createElement("style");
	styleElement.id = cssStyleName;
	styleElement.innerText = css;
	document.head.appendChild(styleElement);
};

const updateCustomCSS = (cssStyleName: string, css: string) => {
	const styleElement = document.getElementById(cssStyleName);
	if (styleElement) {
		styleElement.innerText = css;
	} else {
		addCustomCSS(cssStyleName, css);
	}
};

const makeStyleName = (rule: ColorRule): string => {
	return `afc-${rule.id}-style`;
};
