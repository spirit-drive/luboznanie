import { findFirstBrackets } from '../expression/helpers';
import { applyOperation, DIGIT_REGEXP_STRING } from './operators';
import * as ops from './operators';
import type { CalcOperation } from './operators.types';
import type { Expression } from '../expression/expression.types';
import type { CalcConfig } from './engine.types';

// Класс ошибки, который хранит историю вычислений для отладки
export class CalculatorError extends Error {
  constructor(
    public message: string,
    public history: string[],
  ) {
    super(message);
    this.name = 'CalculatorError';
  }
}

// Регулярка для проверки, является ли строка конечным числом
const IS_NUMBER_REGEXP = new RegExp(`^${DIGIT_REGEXP_STRING}$`);

// Дополнительная проверка, чтобы не считать "NaN" числом
const isNumber = (exp: Expression): boolean => {
  const trimmed = exp.trim();
  return IS_NUMBER_REGEXP.test(trimmed) && trimmed !== 'NaN';
};

export const createCalc = (config: CalcConfig) => {
  // Основная функция калькулятора
  const calc = (expression: Expression): string => {
    let currentExpression = expression;
    const history: string[] = [currentExpression];

    // Защита от бесконечных циклов
    const MAX_STEPS = 1000;
    let stepCount = 0;

    // Цикл работает, пока выражение меняется
    while (stepCount < MAX_STEPS) {
      stepCount++;

      // 1. Проверка на успешное завершение
      if (isNumber(currentExpression)) {
        return currentExpression;
      }

      let expressionChangedInThisLoop = false;

      // 2. Приоритет №0: Скобки
      const brackets = findFirstBrackets(currentExpression);

      if (brackets) {
        try {
          // Рекурсивно вычисляем то, что внутри скобок
          const innerResult = calc(brackets.expression);

          // Заменяем скобки на результат
          const nextExpression =
            currentExpression.slice(0, brackets.start) + innerResult + currentExpression.slice(brackets.end);

          currentExpression = nextExpression;
          history.push(currentExpression);

          // Начинаем цикл заново
          continue;
        } catch (error) {
          if (error instanceof CalculatorError) {
            throw error;
          }
          throw new CalculatorError(`Error inside brackets: ${brackets.expression}`, history);
        }
      }

      // 3. Приоритет №1..N: Операции по уровням
      for (const level of config) {
        // Ищем САМУЮ ЛЕВУЮ операцию в текущем уровне
        let bestMatch: { index: number; op: CalcOperation } | null = null;

        for (const op of level) {
          // Сбрасываем lastIndex, это обязательно для exec с флагом /g
          if (op.regexp.global) op.regexp.lastIndex = 0;

          // ИСПРАВЛЕНИЕ ЗДЕСЬ: используем exec вместо match
          // exec возвращает полноценный объект с index даже для глобальных регулярок
          const match = op.regexp.exec(currentExpression);

          if (match) {
            // Если мы еще ничего не нашли ИЛИ нашли совпадение левее текущего лучшего
            if (bestMatch === null || match.index < bestMatch.index) {
              bestMatch = { index: match.index, op };
            }
          }
        }

        // Если в этом уровне нашлась операция
        if (bestMatch) {
          // Применяем операцию
          const nextExpression = applyOperation(currentExpression, bestMatch.op);

          // Проверяем, действительно ли что-то изменилось
          if (nextExpression !== currentExpression) {
            currentExpression = nextExpression;
            history.push(currentExpression);
            expressionChangedInThisLoop = true;

            // Прерываем перебор уровней и начинаем с самого верха
            break;
          }
        }
      }

      // Если мы прошли скобки и все уровни, но выражение не изменилось
      if (!expressionChangedInThisLoop) {
        if (isNumber(currentExpression)) {
          return currentExpression;
        }
        throw new CalculatorError(`Cannot resolve expression: "${currentExpression}"`, history);
      }
    }

    throw new CalculatorError('Computation limit exceeded (infinite loop?)', history);
  };

  return calc;
};

// Уровень 0: Высокоуровневые действия над функциями (Symbolic / Calculus)
// Сюда входит производная. Она должна сработать раньше, чем 'x' заменится на число (если бы x был переменной),
// или раньше, чем функции начнут считаться.
const level0_Calculus = [ops.der];

// Уровень 1: Переменные и Константы
// Здесь происходит подстановка значений. pi -> 3.14.
// Если бы у нас была переменная x = 10, она была бы здесь.
const level1_Variables = [ops.pi, ops.e];

// Уровень 2: Функции (Тригонометрия, Факториал, Модуль)
// Вычисляются от уже подставленных чисел.
const level2_Functions = [
  ops.sin,
  ops.cos,
  ops.tan,
  ops.cot,
  ops.sec,
  ops.csc,
  ops.fact, // 5!
  ops.abs, // abs(-5)
];

// Уровень 3: Степени, Корни, Логарифмы
// Связанные математические операции.
const level3_ExpRootLog = [
  ops.pow, // ^
  ops.sqrt, // sqrt
  ops.log,
  ops.lg,
];

// Уровень 4: Умножение, Деление, Остаток
const level4_MulDiv = [ops.mul, ops.div, ops.mod];

// Уровень 5: Сложение, Вычитание
const level5_SumSub = [ops.sum, ops.sub];

// Собираем итоговый конфиг
const config = [level0_Calculus, level1_Variables, level2_Functions, level3_ExpRootLog, level4_MulDiv, level5_SumSub];

export const calc = createCalc(config);
