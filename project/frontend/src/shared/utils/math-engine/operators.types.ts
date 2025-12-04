export type CalcOperation = {
  // RegExp должен иметь захватывающие группы (...) для аргументов
  regexp: RegExp;
  // Теперь функция может принимать и числа, и строки (для производных)
  fn: (...args: (number | string)[]) => string;
  // Флаг, указывающий, нужно ли пытаться парсить аргументы как числа
  // По умолчанию true. Для производной будет false.
  parseArgs?: boolean;
  name: string;
};
