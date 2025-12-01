export type OperatorFn = (a: number, b: number) => number;
export type FunctionFn = (...args: number[]) => number;

export enum Associativity {
  Left,
  Right,
}

export interface OperatorConfig {
  precedence: number;
  associativity: Associativity;
  fn: OperatorFn;
}

export interface FunctionConfig {
  fn: FunctionFn;
  argCount?: number; // Optional: strict argument counting
}

export interface TokenType {
  type: 'NUMBER' | 'OPERATOR' | 'FUNCTION' | 'LPAREN' | 'RPAREN' | 'COMMA';
  value: string;
}
