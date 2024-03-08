import { ColorRule } from "src/model/ColorRule";

export const updateRuleStyle = async (rule: ColorRule) => {
  const styleName = makeStyleName(rule);
  updateCustomCSS(styleName, `
		.${styleName} {
			background-color: color-mix(in srgb, ${rule.color} 15%, transparent);
		}
	`);
}

export const addCustomCSS = (cssstylename: string, css: string) => {
  const styleElement = document.createElement('style');
  styleElement.id = cssstylename;
  styleElement.innerText = css;
  document.head.appendChild(styleElement);
}

export const updateCustomCSS = (cssstylename: string, css: string) => {
  const styleElement = document.getElementById(cssstylename);
  if (styleElement) {
    styleElement.innerText = css;
  } else {
    addCustomCSS(cssstylename, css);
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
