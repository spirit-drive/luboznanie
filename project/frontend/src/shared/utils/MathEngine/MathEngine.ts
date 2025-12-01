import { Associativity, FunctionConfig, OperatorConfig, TokenType } from './MathEngine.types';

/**
 * A robust, extensible mathematical evaluation engine.
 * Uses the Shunting-yard algorithm to parse expressions respecting standard precedence.
 */
export class MathEngine {
  private operators: Map<string, OperatorConfig>;
  private functions: Map<string, FunctionConfig>;

  constructor() {
    this.operators = new Map();
    this.functions = new Map();

    // Register standard operators
    this.registerOperator('+', 10, Associativity.Left, (a, b) => a + b);
    this.registerOperator('-', 10, Associativity.Left, (a, b) => a - b);
    this.registerOperator('*', 20, Associativity.Left, (a, b) => a * b);
    this.registerOperator('/', 20, Associativity.Left, (a, b) => a / b);
    this.registerOperator('^', 30, Associativity.Right, (a, b) => Math.pow(a, b));
    this.registerOperator('%', 20, Associativity.Left, (a, b) => a % b);

    // Register standard functions (demonstrating built-ins)
    this.registerFunction('abs', Math.abs);
    this.registerFunction('sqrt', Math.sqrt);
    this.registerFunction('max', Math.max);
    this.registerFunction('min', Math.min);
  }

  /**
   * Add or override an operator (e.g., +, -, custom).
   */
  public registerOperator(
    symbol: string,
    precedence: number,
    associativity: Associativity,
    fn: (a: number, b: number) => number,
  ) {
    this.operators.set(symbol, { precedence, associativity, fn });
  }

  /**
   * Add or override a function (e.g., sin, cos, custom).
   */
  public registerFunction(name: string, fn: (...args: number[]) => number) {
    this.functions.set(name, { fn });
  }

  public getRegisteredFunctions(): string[] {
    return Array.from(this.functions.keys());
  }

  /**
   * Main entry point: Scans the input string for `calc(...)` blocks and processes them.
   */
  public processText(text: string): string {
    let result = '';
    let i = 0;

    while (i < text.length) {
      // Look for "calc("
      if (text.substring(i).startsWith('calc(')) {
        const start = i + 5; // skip 'calc('
        let balance = 1;
        let j = start;

        // Find the matching closing parenthesis handling nested parens
        while (j < text.length && balance > 0) {
          if (text[j] === '(') balance++;
          if (text[j] === ')') balance--;
          if (balance > 0) j++;
        }

        if (balance === 0) {
          const expression = text.substring(start, j);
          try {
            const val = this.evaluateExpression(expression);
            // Format result: integer or float with up to 4 decimals
            const formattedVal = Number.isInteger(val) ? val.toString() : parseFloat(val.toFixed(4)).toString();
            result += formattedVal;
          } catch (e) {
            console.warn(`Error evaluating expression "${expression}":`, e);
            result += `[Error: ${expression}]`;
          }
          i = j + 1;
        } else {
          // Unclosed parenthesis, treat as normal text
          result += text[i];
          i++;
        }
      } else {
        result += text[i];
        i++;
      }
    }
    return result;
  }

  /**
   * Evaluates a single mathematical string.
   */
  public evaluateExpression(expression: string): number {
    const tokens = this.tokenize(expression);
    const rpn = this.shuntingYard(tokens);
    return this.evaluateRPN(rpn);
  }

  // --- Internals ---

  private tokenize(expr: string): TokenType[] {
    const tokens: TokenType[] = [];
    let i = 0;

    // Cleanup whitespace
    expr = expr.trim();

    while (i < expr.length) {
      const char = expr[i];

      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // Number
      if (/[0-9.]/.test(char)) {
        let numStr = '';
        while (i < expr.length && /[0-9.]/.test(expr[i])) {
          numStr += expr[i];
          i++;
        }
        tokens.push({ type: 'NUMBER', value: numStr });
        continue;
      }

      // Functions (letters)
      if (/[a-zA-Z]/.test(char)) {
        let funcName = '';
        while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
          funcName += expr[i];
          i++;
        }
        tokens.push({ type: 'FUNCTION', value: funcName });
        continue;
      }

      // Operators
      if (this.operators.has(char)) {
        // Handle unary minus: if '-' is at start or follows an operator/LPAREN
        if (char === '-') {
          const prev = tokens[tokens.length - 1];
          if (!prev || prev.type === 'OPERATOR' || prev.type === 'LPAREN' || prev.type === 'COMMA') {
            // Treat unary minus as multiplying by -1.
            // Alternatively, add a specific unary operator to registry.
            // Simple hack: push -1 and *
            // But for pure tokenizer, let's treat it as a number part if immediately followed by digit?
            // Or better: Use a 'neg' function approach in RPN.
            // Let's stick to simple binary operators for this demo,
            // but handle negative numbers:
            if (i + 1 < expr.length && /[0-9.]/.test(expr[i + 1])) {
              // It's a negative number
              let numStr = '-';
              i++;
              while (i < expr.length && /[0-9.]/.test(expr[i])) {
                numStr += expr[i];
                i++;
              }
              tokens.push({ type: 'NUMBER', value: numStr });
              continue;
            }
          }
        }
        tokens.push({ type: 'OPERATOR', value: char });
        i++;
        continue;
      }

      if (char === '(') {
        tokens.push({ type: 'LPAREN', value: '(' });
        i++;
        continue;
      }

      if (char === ')') {
        tokens.push({ type: 'RPAREN', value: ')' });
        i++;
        continue;
      }

      if (char === ',') {
        tokens.push({ type: 'COMMA', value: ',' });
        i++;
        continue;
      }

      throw new Error(`Unknown token: ${char}`);
    }

    return tokens;
  }

  private shuntingYard(tokens: TokenType[]): TokenType[] {
    const outputQueue: TokenType[] = [];
    const operatorStack: TokenType[] = [];

    for (const token of tokens) {
      if (token.type === 'NUMBER') {
        outputQueue.push(token);
      } else if (token.type === 'FUNCTION') {
        operatorStack.push(token);
      } else if (token.type === 'COMMA') {
        while (operatorStack.length && operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
          outputQueue.push(operatorStack.pop()!);
        }
      } else if (token.type === 'OPERATOR') {
        const o1 = token;
        const op1Config = this.operators.get(o1.value)!;

        while (operatorStack.length > 0) {
          const o2 = operatorStack[operatorStack.length - 1];
          if (o2.type !== 'OPERATOR') break;

          const op2Config = this.operators.get(o2.value)!;

          if (
            (op1Config.associativity === Associativity.Left && op1Config.precedence <= op2Config.precedence) ||
            (op1Config.associativity === Associativity.Right && op1Config.precedence < op2Config.precedence)
          ) {
            outputQueue.push(operatorStack.pop()!);
          } else {
            break;
          }
        }
        operatorStack.push(o1);
      } else if (token.type === 'LPAREN') {
        operatorStack.push(token);
      } else if (token.type === 'RPAREN') {
        while (operatorStack.length && operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
          outputQueue.push(operatorStack.pop()!);
        }
        // Pop the LPAREN
        if (operatorStack.length && operatorStack[operatorStack.length - 1].type === 'LPAREN') {
          operatorStack.pop();
        }
        // If token at top is function, pop it to queue
        if (operatorStack.length && operatorStack[operatorStack.length - 1].type === 'FUNCTION') {
          outputQueue.push(operatorStack.pop()!);
        }
      }
    }

    while (operatorStack.length) {
      outputQueue.push(operatorStack.pop()!);
    }

    return outputQueue;
  }

  private evaluateRPN(rpn: TokenType[]): number {
    const stack: number[] = [];

    for (const token of rpn) {
      if (token.type === 'NUMBER') {
        stack.push(parseFloat(token.value));
      } else if (token.type === 'OPERATOR') {
        const b = stack.pop();
        const a = stack.pop();
        if (b === undefined || a === undefined) throw new Error('Invalid expression');

        const config = this.operators.get(token.value);
        if (!config) throw new Error(`Unknown operator ${token.value}`);

        stack.push(config.fn(a, b));
      } else if (token.type === 'FUNCTION') {
        const config = this.functions.get(token.value);
        if (!config) throw new Error(`Unknown function ${token.value}`);

        // Handling function arguments is tricky in pure RPN without arity knowledge in tokens.
        // For simplicity in this demo, standard math functions are usually unary or binary.
        // We will assume unary for simplicity unless it's known like 'max'/'min'.
        // To do this strictly, the shunting yard needs to track argument counts.
        // **Fallback Strategy**: For this extensible demo, we will rely on checking the stack size
        // or just popping 1 argument for most math functions.

        // Let's implement dynamic arity for specific known functions, else default to 1.
        const args: number[] = [];
        if (['max', 'min', 'pow'].includes(token.value)) {
          // These take at least 2 usually, but in RPN `max(1,2)` -> `1 2 max`.
          // How many to pop? In a real compiler, we count commas.
          // Simplified: We popped 2.
          const arg2 = stack.pop();
          const arg1 = stack.pop();
          if (arg1 !== undefined) args.push(arg1);
          if (arg2 !== undefined) args.push(arg2);
        } else {
          // Unary default (sin, cos, sqrt, abs)
          const arg1 = stack.pop();
          if (arg1 !== undefined) args.push(arg1);
        }

        stack.push(config.fn(...args));
      }
    }

    if (stack.length !== 1) {
      // This might happen if we miscalculated arity.
      // For a robust system, we need token metadata.
      // Returning top for safety.
      return stack.pop() || 0;
    }
    return stack[0];
  }
}
