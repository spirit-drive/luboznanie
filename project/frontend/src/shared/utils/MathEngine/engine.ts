import { findFirstBrackets } from './helpers';
import { applyOperation, CalcOperation, Expression, DIGIT_REGEXP_STRING } from './operators';

// Типы конфигурации
export type CalcConfigLevel = CalcOperation[];
export type CalcConfig = CalcConfigLevel[];

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

// Регулярка для проверки, является ли строка конечным числом (например "5", "-5", "5,5")
// Используем якоря ^ и $, чтобы убедиться, что вся строка — это число
const IS_NUMBER_REGEXP = new RegExp(`^${DIGIT_REGEXP_STRING}$`);

const isNumber = (exp: Expression): boolean => IS_NUMBER_REGEXP.test(exp.trim());

export const createCalc = (config: CalcConfig) => {
  // Основная функция калькулятора
  const calc = (expression: Expression): string => {
    let currentExpression = expression;
    const history: string[] = [currentExpression];

    // Защита от бесконечных циклов (например, если правило замены создает само себя)
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

      // 2. Приоритет №0: Скобки (Группировка)
      // findFirstBrackets (с флагом \B) находит только группирующие скобки (1+2),
      // игнорируя вызовы функций sin(30).
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

          // Начинаем главный цикл заново (возможно открылись новые операции)
          continue;
        } catch (error) {
          // Если внутри скобок ошибка, прокидываем её наверх,
          // добавляя текущий контекст, если нужно.
          // В данной реализации просто прерываем.
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
          // Сбрасываем lastIndex, если регулярка глобальная (на всякий случай)
          if (op.regexp.global) op.regexp.lastIndex = 0;

          const match = currentExpression.match(op.regexp);

          if (match && match.index !== undefined) {
            // Если мы еще ничего не нашли ИЛИ нашли совпадение левее текущего лучшего
            if (bestMatch === null || match.index < bestMatch.index) {
              bestMatch = { index: match.index, op };
            }
          }
        }

        // Если в этом уровне нашлась операция
        if (bestMatch) {
          const nextExpression = applyOperation(currentExpression, bestMatch.op);

          // Проверяем, действительно ли что-то изменилось (защита от холостых срабатываний)
          if (nextExpression !== currentExpression) {
            currentExpression = nextExpression;
            history.push(currentExpression);
            expressionChangedInThisLoop = true;

            // ВАЖНО: Прерываем перебор уровней и начинаем с самого верха (loop while),
            // так как результат операции мог открыть более приоритетные действия (например, скобки)
            break;
          }
        }
      }

      // Если мы прошли скобки и все уровни, но выражение не изменилось
      if (!expressionChangedInThisLoop) {
        // Тупик. Либо это число (проверено в начале), либо неразрешимое выражение.
        if (isNumber(currentExpression)) {
          return currentExpression;
        }
        // Если остались буквы/символы, кидаем ошибку с историей
        throw new CalculatorError(`Cannot resolve expression: "${currentExpression}"`, history);
      }
    }

    throw new CalculatorError('Computation limit exceeded (infinite loop?)', history);
  };

  return calc;
};
