import { CalcOperation } from './operators.types';
import { Expression } from '@/shared/utils/expression/expression.types';

export type CalcConfigLevel = CalcOperation[];
export type CalcConfig = CalcConfigLevel[];
export type HistoryItem = {
  expression: Expression;
  newExpression: Expression;
  operation: string;
  args: Array<string | number>;
  index: number;
};
