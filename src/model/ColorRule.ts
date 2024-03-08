import { RuleType } from 'src/model/RuleType';


export interface ColorRule {
    id: string;
    value: string;
    type: RuleType;
    color: string;
}
