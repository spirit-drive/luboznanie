// --- Types ---
export type Expression = string;

export type CalcOperation = {
  // RegExp должен иметь захватывающие группы (...) для аргументов
  regexp: RegExp;
  // Теперь функция может принимать и числа, и строки (для производных)
  fn: (...args: (number | string)[]) => string;
  // Флаг, указывающий, нужно ли пытаться парсить аргументы как числа
  // По умолчанию true. Для производной будет false.
  parseArgs?: boolean;
};

// --- Constants ---
// Регулярка для числа: целое или дробное с запятой, может быть отрицательным
export const DIGIT_REGEXP_STRING = '-?\\d+(?:,\\d*)?';

// Helper для экранирования
const D = DIGIT_REGEXP_STRING;
// Helper для создания стандартной бинарной операции: A op B
const binaryOpRegexp = (op: string) => new RegExp(`(${D})\\s*\\${op}\\s*(${D})`);
// Helper: Создание регулярки для функции "name(args...)"
const funcOpRegexp = (name: string) => new RegExp(`${name}\\((.*?)\\)`);
// Примечание: (.*?) захватывает всё внутри скобок, разбор аргументов делаем внутри applyOperation

// Helper для форматирования результата (возвращаем запятую, убираем лишние нули если нужно)
// Helper: форматирование числа в строку с запятой
const format = (num: number): string => {
  // Если число очень маленькое (погрешность), считаем 0
  if (Math.abs(num) < 1e-10) return '0';
  return parseFloat(num.toFixed(10)).toString().replace('.', ',');
};

// --- Implementation ---
// --- Core Logic ---

export const applyOperation = (expression: Expression, operation: CalcOperation): string => {
  const match = expression.match(operation.regexp);
  if (!match) return expression;

  const fullMatch = match[0];

  // Если это функция со скобками, аргументы могут быть разделены запятой или пробелом
  // Но в нашей текущей архитектуре match[1]..match[n] это группы regexp.
  // Для универсальности берем захваченные группы:
  const rawArgs = match.slice(1);

  // СПЕЦИАЛЬНЫЙ КЕЙС: Если регулярка захватила "x^2, x" как одну группу (для функций типа der),
  // нам нужно разбить её вручную, если это предусмотрено логикой.
  // Но для простоты будем полагаться на то, что RegExp составлен правильно.

  let parsedArgs: (number | string)[];

  if (operation.parseArgs === false) {
    // Если операция символьная (производная), отдаем строки как есть
    // Убираем пробелы по краям
    parsedArgs = rawArgs.map((s) => s.trim());
  } else {
    // Пытаемся превратить в числа
    parsedArgs = rawArgs.map((arg) => {
      // Если аргумент содержит запятую внутри функции (например log(a, b)),
      // наша простая регулярка могла захватить лишнее, но допустим у нас строгие регулярки.
      const normalized = arg.replace(',', '.');
      const num = parseFloat(normalized);
      return isNaN(num) ? arg : num;
    });
  }

  try {
    // @ts-ignore - TS не знает типы конкретной функции
    const resultString = operation.fn(...parsedArgs);

    // Нормализуем результат обратно в запятые
    const normalizedResult = resultString.toString().replace('.', ',');
    return expression.replace(fullMatch, normalizedResult);
  } catch (e) {
    // Если ошибка вычисления, возвращаем как было (или можно выбрасывать ошибку выше)
    return expression;
  }
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

export const tan: CalcOperation = {
  regexp: funcOpRegexp('tan'), // tan(x)
  fn: (a: number) => format(Math.tan(a)),
};

// Котангенс: cot(x) = 1 / tan(x)
export const cot: CalcOperation = {
  regexp: funcOpRegexp('cot'),
  fn: (a: number) => {
    const t = Math.tan(a);
    if (Math.abs(t) < 1e-10) throw new Error('Cotangent undefined');
    return format(1 / t);
  },
};

// Секанс: sec(x) = 1 / cos(x)
export const sec: CalcOperation = {
  regexp: funcOpRegexp('sec'),
  fn: (a: number) => {
    const c = Math.cos(a);
    if (Math.abs(c) < 1e-10) throw new Error('Secant undefined');
    return format(1 / c);
  },
};

// Косеканс: csc(x) = 1 / sin(x)
export const csc: CalcOperation = {
  regexp: funcOpRegexp('csc'),
  fn: (a: number) => {
    const s = Math.sin(a);
    if (Math.abs(s) < 1e-10) throw new Error('Cosecant undefined');
    return format(1 / s);
  },
};

// === 3. Алгебра и Комбинаторика ===

// Модуль: abs(-5) -> 5
export const abs: CalcOperation = {
  regexp: funcOpRegexp('abs'),
  fn: (a: number) => format(Math.abs(a)),
};

// Факториал: 5! -> 120 (Постфиксная операция)
export const fact: CalcOperation = {
  // RegExp: число, за которым следует восклицательный знак
  regexp: new RegExp(`(${D})!`),
  fn: (a: number) => {
    if (a < 0) return 'Error'; // Факториал отрицательного не считаем
    if (!Number.isInteger(a)) return format(Math.gamma(a + 1)); // Гамма-функция для дробных (опционально) или Error

    let result = 1;
    for (let i = 2; i <= a; i++) result *= i;
    return format(result);
  },
};

// === 4. Константы (Variables) ===

export const pi: CalcOperation = {
  regexp: /pi/g, // Просто замена слова
  fn: () => '3,1415926535',
};

export const e: CalcOperation = {
  regexp: /\be\b/g, // \b чтобы не заменять 'e' внутри слов (tExt -> t3.14xt - плохо)
  fn: () => '2,7182818284',
};

// === 5. Высшая математика (Symbolic) ===

// Производная: der(expression, var)
// Пример: der(x^2, x) -> 2*x
// Пример: der(x, x) -> 1
// Пример: der(5, x) -> 0
export const der: CalcOperation = {
  // Сложная регулярка: der( что-то, переменная )
  // Мы предполагаем, что внутри нет скобок (или они уже решены).
  // Группа 1: выражение, Группа 2: переменная
  regexp: /der\s*\(\s*(.*?)\s*,\s*([a-z]+)\s*\)/,
  parseArgs: false, // ВАЖНО: не пытаться парсить как числа
  fn: (expr: string, v: string) => {
    // Это ОЧЕНЬ упрощенная логика дифференцирования.
    // По-хорошему нужен парсер AST. Но для примера RegExp подхода:

    const variable = v.trim();
    const expression = expr.trim();

    // 1. Производная константы (если нет переменной в выражении)
    if (!expression.includes(variable)) return '0';

    // 2. Производная самой переменной: der(x, x) -> 1
    if (expression === variable) return '1';

    // 3. Степенная функция: x^n -> n*x^(n-1)
    // Ищем паттерн: var ^ число
    const powerMatch = expression.match(new RegExp(`^${variable}\\^(${D})$`));
    if (powerMatch) {
      const power = parseFloat(powerMatch[1].replace(',', '.'));
      const newPower = power - 1;

      if (newPower === 1) return `${power}*${variable}`; // 2*x^1 -> 2*x
      if (newPower === 0) return `${power}`; // x^1 -> 1
      return `${format(power)}*${variable}^${format(newPower)}`;
    }

    // 4. Линейный коэффициент: C*x -> C
    // Паттерн: число * var
    const linMatch = expression.match(new RegExp(`^(${D})\\*${variable}$`));
    if (linMatch) {
      return linMatch[1]; // Возвращаем число
    }

    return 'Unsolved'; // Если слишком сложно для наших регулярок
  },
};

export type CalcConfigLevel = CalcOperation[];
export type CalcConfig = CalcConfigLevel[];

export const createCalc = (config: CalcConfig) => (expression: Expression) => {};
