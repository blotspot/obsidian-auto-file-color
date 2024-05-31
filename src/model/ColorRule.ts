import { RuleType } from "src/model/RuleType";

export type ColorRule = {
	id: string;
	key: string;
	value: string;
	type: RuleType;
	color: string;
};
