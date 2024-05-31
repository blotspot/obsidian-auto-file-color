import { RuleType } from "src/model/RuleType";
import { ColorRule } from "src/model/ColorRule";

export type AutoFileColorSettings = {
	onlyMainFolder: boolean;
	colorRules: ColorRule[];
};

export const DEFAULT_SETTINGS: AutoFileColorSettings = {
	onlyMainFolder: true,
	colorRules: [
		{
			id: "status-draft",
			key: "status",
			value: "draft",
			type: RuleType.Frontmatter,
			color: "#f25c05",
		},
		{
			id: "status-revised-draft",
			key: "status",
			value: "revised draft",
			type: RuleType.Frontmatter,
			color: "#f2b705",
		},
		{
			id: "status-improvements",
			key: "status",
			value: "needs improvements",
			type: RuleType.Frontmatter,
			color: "#618c03",
		},
		{
			id: "status-postable-draft",
			key: "status",
			value: "postable",
			type: RuleType.Frontmatter,
			color: "#71a8d9",
		},
		{
			id: "status-published",
			key: "status",
			value: "published",
			type: RuleType.Frontmatter,
			color: "#c44545",
		},
	],
};
