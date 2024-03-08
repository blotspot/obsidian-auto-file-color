import { ColorRule } from 'src/model/ColorRule';

export const updateRuleStyle = async (rule: ColorRule) => {
  const styleName = makeStyleName(rule);
  updateCustomCSS(styleName, `
		.${styleName} {
			background-color: color-mix(in srgb, ${rule.color} 15%, transparent);
		}
	`);
}

export const addCustomCSS = (cssStyleName: string, css: string) => {
  const styleElement = document.createElement('style');
  styleElement.id = cssStyleName;
  styleElement.innerText = css;
  document.head.appendChild(styleElement);
}

export const updateCustomCSS = (cssStyleName: string, css: string) => {
  const styleElement = document.getElementById(cssStyleName);
  if (styleElement) {
    styleElement.innerText = css;
  } else {
    addCustomCSS(cssStyleName, css);
  }
}

export const removeRuleStyles = async (rule: ColorRule) => {
  const style = makeStyleName(rule);
  const styleElement = document.getElementById(style);
  if (styleElement) {
    styleElement.remove();
  }
}

export const addCustomClasses = (element: Element, rule: ColorRule) => {
  element.classList.add(makeStyleName(rule));
}

export const removeCustomClasses = (element: Element, rule: ColorRule) => {
  element.classList.remove(makeStyleName(rule));
}

export const makeStyleName = (rule: ColorRule): string => {
  return `afc-${rule.id}-style`;
}
