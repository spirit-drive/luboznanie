// --- Types ---
export type Expression = string;

export type CalcOperation = {
  // RegExp должен иметь захватывающие группы (...) для аргументов
  regexp: RegExp;
  // Функция принимает числа, но возвращает строку (результат замены)
  fn: (...args: unknown[]) => string;
};

// --- Constants ---
// Регулярка для числа: целое или дробное с запятой, может быть отрицательным
export const DIGIT_REGEXP_STRING = '-?\\d+(?:,\\d*)?';

// Helper для экранирования
const D = DIGIT_REGEXP_STRING;
// Helper для создания стандартной бинарной операции: A op B
const binaryOpRegexp = (op: string) => new RegExp(`(${D})\\s*\\${op}\\s*(${D})`);
// Helper для функций: name(A)
const funcOpRegexp = (name: string) => new RegExp(`${name}\\(\\s*(${D})\\s*\\)`);
// Helper для форматирования результата (возвращаем запятую, убираем лишние нули если нужно)
const format = (num: number): string => {
  // Округляем до 10 знаков, чтобы убрать мусор float (0.000000001), и меняем точку на запятую
  return parseFloat(num.toFixed(10)).toString().replace('.', ',');
};

// --- Implementation ---

export const applyOperation = (expression: Expression, operation: CalcOperation): string => {
  const match = expression.match(operation.regexp);

  // Если совпадений нет, возвращаем исходную строку
  if (!match) return expression;

  // match[0] - всё выражение (например "2 + 2")
  // match[1...] - захваченные группы (аргументы)
  const fullMatch = match[0];
  const argsStrings = match.slice(1);

  // Преобразуем аргументы: "2,5" -> 2.5
  const argsNumbers = argsStrings.map((arg) => parseFloat(arg.replace(',', '.')));

  // Вычисляем результат. argsNumbers передаются как отдельные аргументы
  const resultString = operation.fn(...argsNumbers);

  // ВАЖНО: Результат должен соответствовать формату чисел (с запятой),
  // чтобы следующие регулярки могли его подхватить.
  const normalizedResult = resultString.replace('.', ',');

  // Заменяем ТОЛЬКО первое вхождение (слева направо)
  return expression.replace(fullMatch, normalizedResult);
};

// --- Operations Definitions ---

// 1. Арифметика (Низкий уровень)
export const sum: CalcOperation = {
  regexp: binaryOpRegexp('+'),
  fn: (a: number, b: number) => format(a + b),
};

export const sub: CalcOperation = {
  regexp: binaryOpRegexp('-'),
  fn: (a: number, b: number) => format(a - b),
};

export const mul: CalcOperation = {
  regexp: binaryOpRegexp('*'),
  fn: (a: number, b: number) => format(a * b),
};

export const div: CalcOperation = {
  regexp: binaryOpRegexp('/'),
  fn: (a: number, b: number) => {
    if (b === 0) throw new Error('Division by zero');
    return format(a / b);
  },
};

export const mod: CalcOperation = {
  regexp: binaryOpRegexp('%'),
  fn: (a: number, b: number) => format(a % b),
};

// 2. Функции, Степени, Корни (Средний уровень)

export const pow: CalcOperation = {
  regexp: binaryOpRegexp('^'),
  fn: (a: number, b: number) => format(Math.pow(a, b)),
};

// Логарифм натуральный: log(x)
export const log: CalcOperation = {
  regexp: funcOpRegexp('log'),
  fn: (a: number) => format(Math.log(a)), // База e
};

// Логарифм по основанию 10: lg(x)
export const lg: CalcOperation = {
  regexp: funcOpRegexp('lg'),
  fn: (a: number) => format(Math.log10(a)),
};

// Квадратный корень: sqrt(x)
export const sqrt: CalcOperation = {
  regexp: funcOpRegexp('sqrt'),
  fn: (a: number) => format(Math.sqrt(a)),
};

// Тригонометрия
export const sin: CalcOperation = {
  regexp: funcOpRegexp('sin'),
  fn: (a: number) => format(Math.sin(a)), // Принимает радианы
};

export const cos: CalcOperation = {
  regexp: funcOpRegexp('cos'),
  fn: (a: number) => format(Math.cos(a)),
};

export type CalcConfigLevel = CalcOperation[];
export type CalcConfig = CalcConfigLevel[];

export const createCalc = (config: CalcConfig) => (expression: Expression) => {};
