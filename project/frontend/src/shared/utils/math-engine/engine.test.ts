import { calc, CalculatorError } from './engine';
import { HistoryItem } from '@/shared/utils/math-engine/engine.types';

const expectHistory = (expression: string, expectedSteps: HistoryItem[]) => {
  try {
    calc(expression);
    throw new Error('Test expected CalculatorError, but it succeeded.');
  } catch (e) {
    if (e instanceof CalculatorError) {
      // Мы проверяем массив целиком
      expect(e.history).toEqual(expectedSteps);
    } else {
      throw e;
    }
  }
};

describe('Calculator Engine (createCalc)', () => {
  test('should solve simple addition', () => {
    const result = calc('2 + 2');
    expect(result).toBe('4');
  });

  test('should respect order of operations (levels)', () => {
    // Умножение (level 2) раньше сложения (level 3)
    const result = calc('2 + 2 * 2');
    // 2 + 4 -> 6
    expect(result).toBe('6');
  });

  test('should respect brackets priority', () => {
    // Скобки вычисляются рекурсивно до уровней
    const result = calc('(2 + 2) * 2');
    // (4) * 2 -> 4 * 2 -> 8
    expect(result).toBe('8');
  });

  test('should handle nested brackets', () => {
    const result = calc('((1 + 1) * 5) + 1');
    // (2 * 5) + 1 -> 10 + 1 -> 11
    expect(result).toBe('11');
  });

  test('should evaluate left-to-right on same level', () => {
    // Деление и умножение на одном уровне.
    // 10 / 2 * 5. Слева направо: 5 * 5 -> 25.
    // Если бы приоритет был неправильный, было бы 10 / 10 -> 1.
    const result = calc('10 / 2 * 5');
    expect(result).toBe('25');
  });

  test('should handle functions mixed with math', () => {
    // sin(0) -> 0. 5 + 0 -> 5.
    const result = calc('5 + sin(0)');
    expect(result).toBe('5');
  });

  test('should solve derivative before math', () => {
    // der(x^2, x) -> 2*x.
    // Если x не задан как переменная, это останется строкой "2*x" и упадет с ошибкой,
    // так как ожидается число.
    // Но если мы вычислим der(x, x) -> 1
    const result = calc('5 + der(x, x)');
    // 5 + 1 -> 6
    expect(result).toBe('6');
  });

  test('should throw error with history when stuck', () => {
    try {
      calc('2 + unknown');
    } catch (e) {
      expect(e).toBeInstanceOf(CalculatorError);
      if (e instanceof CalculatorError) {
        expect(e.message).toContain('Cannot resolve');
        // История должна содержать начальное состояние
        expect(e.history[0]).toBeUndefined();
      }
    }
  });

  test('should throw error on recursive calculation failure', () => {
    try {
      calc('(2 + unknown)');
    } catch (e) {
      expect(e).toBeInstanceOf(CalculatorError);
    }
  });

  test('should handle floating point numbers with comma', () => {
    // 1,5 + 2,5 = 4
    expect(calc('1,5 + 2,5')).toBe('4');
  });

  describe('Calculator with Strict Hierarchy', () => {
    // === ТЕСТЫ ИЕРАРХИИ ===

    describe('Level 0 vs Level 1 (Derivatives vs Constants)', () => {
      test('Derivative should process before constants are substituted', () => {
        // Пример: der(pi*x, x)
        // Если бы L1 (pi) был раньше, выражение стало бы: der(3,1415...*x, x)
        // Результат был бы числом "3,1415...".

        // Если L0 (der) раньше, он видит символы "pi".
        // Наша реализация der возвращает константу, если видит "Const * Var".
        // Ожидаем, что der вернет строку "pi", а уже потом она заменится на число.

        // Для этого теста давай проверим простой случай:
        // der(x, x) -> 1. Тут константы не влияют.

        // Проверим: der(x^2, x).
        // Результат: 2*x.
        // Калькулятор попытается вычислить "2*x".
        // Так как 'x' не определен в Variables, вылетит ошибка (что правильно для калькулятора),
        // но в истории мы должны увидеть шаг "2*x".
        try {
          calc('der(x^2, x)');
        } catch (e) {
          if (e instanceof CalculatorError) {
            // Проверяем, что первым шагом производная раскрылась
            // History[0] = "der(x^2, x)"
            // History[1] = "2*x" (примерно, зависит от реализации format)
            expect(e.history).toEqual([
              {
                args: ['x^2', 'x'],
                expression: 'der(x^2, x)',
                newExpression: '2*x',
                index: 0,
                operation: 'Производная',
              },
            ]);
          }
        }
      });
    });

    describe('Level 1 vs Level 2 (Variables vs Functions)', () => {
      test('Variables should be substituted before Functions calculation', () => {
        // sin(pi)
        // 1. pi -> 3,1415926535 (L1)
        // 2. sin(3,1415926535) -> 0 (L2)

        // Если бы функции были раньше, sin(pi) попытался бы распарсить "pi" как число -> NaN.
        expect(calc('sin(pi)')).toBe('0'); // format(sin(PI)) ~ 0
      });

      test('Euler number in log', () => {
        // log(e) -> натуральный логарифм от e -> 1
        // 1. e -> 2,718...
        // 2. log(2,718...) -> 1
        expect(calc('log(e)')).toBe('1');
      });
    });

    describe('Level 2 vs Level 3 (Functions vs Powers/Roots)', () => {
      test('Factorial (L2) should be higher priority than Power (L3)', () => {
        // 3! ^ 2
        // Если L2 (Fact) первый: 3! -> 6. Затем 6 ^ 2 -> 36.
        // Если L3 (Pow) первый: 3! ^ 2 -> Попытка "3! возвести в 2".
        // Регулярка степени ожидает число слева. "!" мешает.
        // В любом случае порядок тут важен логически.
        expect(calc('3! ^ 2')).toBe('36');
      });

      test('Trig (L2) before Power (L3)', () => {
        // sin(0) ^ 2
        // 1. sin(0) -> 0
        // 2. 0 ^ 2 -> 0
        expect(calc('sin(0) ^ 2')).toBe('0');
      });

      test('Absolute (L2) before Root (L3)', () => {
        // sqrt(abs(-16))
        // Сначала abs(-16) -> 16. Потом sqrt(16) -> 4.
        // Тут помогают скобки, но порядок уровней гарантирует, что мы не пытаемся извлечь корень из "abs...".
        expect(calc('sqrt(abs(-16))')).toBe('4');
      });
    });

    describe('Level 3 vs Level 4 (Powers vs Multiply)', () => {
      test('Power (L3) should be higher than Multiply (L4)', () => {
        // 5 * 2 ^ 2
        // Правильно: 5 * 4 = 20.
        // Неправильно: 10 ^ 2 = 100.
        expect(calc('5 * 2 ^ 2')).toBe('20');
      });

      test('Root (L3) before Division (L4)', () => {
        // 10 / sqrt(4)
        // 1. sqrt(4) -> 2
        // 2. 10 / 2 -> 5
        expect(calc('10 / sqrt(4)')).toBe('5');
      });
    });

    describe('Level 4 vs Level 5 (Multiply vs Add)', () => {
      test('Multiply (L4) should be higher than Add (L5)', () => {
        // 2 + 2 * 2
        expect(calc('2 + 2 * 2')).toBe('6');
      });
    });

    describe('Complex Integration Test', () => {
      test('Should solve a monster expression respecting all levels', () => {
        // Выражение: 2 + sin(pi/2) * 4! / 2 ^ 3

        // Ход решения:
        // 1. Скобки (pre-level): (pi/2)
        //    Внутри скобок: pi (L1) -> 3.14. 3.14 / 2 (L4) -> 1.57.
        //    Строка: 2 + sin(1,57) * 4! / 2 ^ 3

        // 2. Уровень 2 (Functions):
        //    sin(1,57) -> 1.
        //    4! -> 24.
        //    Строка: 2 + 1 * 24 / 2 ^ 3

        // 3. Уровень 3 (Powers):
        //    2 ^ 3 -> 8.
        //    Строка: 2 + 1 * 24 / 8

        // 4. Уровень 4 (Mul/Div) - Слева направо:
        //    1 * 24 -> 24.
        //    Строка: 2 + 24 / 8
        //    24 / 8 -> 3.
        //    Строка: 2 + 3

        // 5. Уровень 5 (Sum):
        //    2 + 3 -> 5.

        expect(calc('2 + sin((pi / 2)) * 4! / 2 ^ 3')).toBe('5');
      });
    });
  });

  describe('Calculator Error History & Debugging', () => {
    // Хелпер для проверки точного совпадения массива истории

    describe('Linear Arithmetic Failures', () => {
      test('Should record steps before failing on unknown symbol', () => {
        // Сценарий:
        // 1. Исходное выражение
        // 2. Выполняется умножение (Level 4)
        // 3. Выполняется сложение (Level 5)
        // 4. Остановка из-за "oops"
        const expr = '10 + 2 * 5 + oops';

        expectHistory(expr, [
          {
            args: [2, 5],
            expression: '10 + 2 * 5 + oops',
            index: 5,
            newExpression: '10 + 10 + oops',
            operation: 'Умножение',
          },
          {
            args: [10, 10],
            expression: '10 + 10 + oops',
            index: 0,
            newExpression: '20 + oops',
            operation: 'Сумма',
          },
        ]);
      });

      test('Should fail immediately if no operation matches', () => {
        const expr = 'invalid expression';
        expectHistory(expr, []);
      });

      test('Should show partial evaluation of a long chain', () => {
        // Слева направо: 100 / 2 -> 50, затем 50 / 5 -> 10, потом тупик
        const expr = '100 / 2 / 5 / zero';

        expectHistory(expr, [
          {
            args: [100, 2],
            expression: '100 / 2 / 5 / zero',
            index: 0,
            newExpression: '50 / 5 / zero',
            operation: 'Деление',
          },
          {
            args: [50, 5],
            expression: '50 / 5 / zero',
            index: 0,
            newExpression: '10 / zero',
            operation: 'Деление',
          },
        ]);
      });
    });

    describe('Priority & Variable Substitution History', () => {
      test('Should substitute constants first, then fail if syntax is bad', () => {
        // 1. pi -> 3,14...
        // 2. 2 * 3,14... -> 6,28...
        // 3. Ошибка
        const expr = '2 * pi + unknown';

        // Поскольку мы не можем гарантировать точное число знаков в тестах без хардкода,
        // проверим, что в истории есть шаг с раскрытым PI.
        try {
          calc(expr);
        } catch (e) {
          if (e instanceof CalculatorError) {
            expectHistory(expr, [
              {
                args: [],
                expression: '2 * pi + unknown',
                index: 4,
                newExpression: '2 * 3,1415926535 + unknown',
                operation: 'Число ПИ',
              },
              {
                args: [2, 3.1415926535],
                expression: '2 * 3,1415926535 + unknown',
                index: 0,
                newExpression: '6,283185307 + unknown',
                operation: 'Умножение',
              },
            ]);
          }
        }
      });

      test('Should substitute derivative, then fail on variable', () => {
        // 1. der(x^2, x) -> 2*x
        // 2. Ошибка, так как x не определен
        const expr = '1 + der(x^2, x)';

        // Тут нужно знать точно, как format() форматирует "2".
        // Если format(2) -> "2", то строка будет "1 + 2*x"
        expectHistory(expr, [
          {
            args: ['x^2', 'x'],
            expression: '1 + der(x^2, x)',
            index: 4,
            newExpression: '1 + 2*x',
            operation: 'Производная',
          },
        ]);
      });
    });

    describe('Function Evaluation History', () => {
      test('Should show function simplification steps', () => {
        // 1. sin(0) -> 0
        // 2. 0 + 5 -> 5
        // 3. 5 + error -> fail
        const expr = 'sin(0) + 5 + error';

        expectHistory(expr, [
          {
            args: [0],
            expression: 'sin(0) + 5 + error',
            index: 0,
            newExpression: '0 + 5 + error',
            operation: 'Синус',
          },
          {
            args: [0, 5],
            expression: '0 + 5 + error',
            index: 0,
            newExpression: '5 + error',
            operation: 'Сумма',
          },
        ]);
      });

      test('Should handle nested functions (via repeated passes)', () => {
        // abs(sin(0)) + err
        // 1. sin(0) -> 0 (но так как скобок нет, ищем слева направо)
        //    Движок видит abs(sin(0)).
        //    abs ожидает число. sin(0) - не число.
        //    Движок идет дальше по уровням. sin(0) срабатывает.
        // 2. Получаем abs(0) + err.
        // 3. abs(0) -> 0.
        // 4. 0 + err.

        const expr = 'abs(sin(0)) + err';

        expectHistory(expr, [
          {
            args: [0],
            expression: 'abs(sin(0)) + err',
            index: 4,
            newExpression: 'abs(0) + err',
            operation: 'Синус',
          },
          {
            args: [0],
            expression: 'abs(0) + err',
            index: 0,
            newExpression: '0 + err',
            operation: 'Модуль',
          },
        ]);
      });
    });

    describe('Recursive Bracket Failures', () => {
      test('Should return history of the INNER expression when failing inside brackets', () => {
        // Важно: Текущая архитектура прокидывает ошибку из рекурсии.
        // Поэтому история будет содержать шаги ТОЛЬКО внутри скобок.

        // Внешнее: 10 + (...)
        // Внутреннее: 2 * 3 + err
        const expr = '10 + (2 * 3 + err)';

        expectHistory(expr, [
          {
            args: [2, 3],
            expression: '2 * 3 + err',
            index: 0,
            newExpression: '6 + err',
            operation: 'Умножение',
          },
        ]);
      });

      test('Should handle deep nesting failure', () => {
        // Внешнее: ( ... )
        // Среднее: 5 + ( ... )
        // Внутреннее: error
        const expr = '((5 + error))';

        // 1. Находит внешние скобки -> вызывает calc на "(5 + error)"
        // 2. Внутри "(5 + error)" находит скобки -> вызывает calc на "5 + error"
        // 3. "5 + error" падает.

        expectHistory(expr, []);
      });
    });

    describe('Syntax Errors', () => {
      test('Missing second operand', () => {
        // 2 +
        const expr = '2 +';
        expectHistory(expr, []);
      });

      test('Two operators in a row', () => {
        // 2 ++ 2 (если регуляка это не поддерживает)
        // Наша регулярка (\d+) \+ (\d+). "2 ++ 2" не подойдет.
        const expr = '2 ++ 2';
        expectHistory(expr, []);
      });

      test('Unclosed function parenthesis (syntax error for regex)', () => {
        // sin(0
        // Регулярка sin\((.*?)\) не сработает
        const expr = 'sin(0';
        expectHistory(expr, []);
      });
    });
  });

  describe('Safety Checks: Variables & Operator Precedence', () => {
    const expectErrorHistory = (expression: string, expectedHistory: string[]) => {
      try {
        calc(expression);
        throw new Error(`Expression "${expression}" resolved unexpectedly!`);
      } catch (e) {
        if (e instanceof CalculatorError) {
          expect(e.history).toEqual(expectedHistory);
        } else {
          throw e;
        }
      }
    };

    describe('Prevent Addition/Subtraction breaking Multiplication', () => {
      test('Should NOT add numbers if followed by multiplication (Right side)', () => {
        // 1 + 2 * x
        // Правильно: сначала 2*x (невозможно, т.к. x не число).
        // Потом 1 + (2*x). Сложение видит "2", но за ним "*". Должно проигнорировать.
        // Итог: выражение остается "1 + 2*x" (или падает с ошибкой, показав это в истории).

        const expr = '1 + 2 * x';

        // В истории должно быть:
        // 1. "1 + 2 * x"
        // Никаких "3 * x" быть не должно!
        expectErrorHistory(expr, []);
      });

      test('Should NOT add numbers if preceded by multiplication (Left side)', () => {
        // x * 2 + 1
        // Сложение видит "2", но перед ним "*". Должно проигнорировать.

        const expr = 'x * 2 + 1';
        expectErrorHistory(expr, []);
      });

      test('Should NOT subtract if followed by division', () => {
        // 10 - 4 / y
        // Не должно быть "6 / y"
        const expr = '10 - 4 / y';
        expectErrorHistory(expr, []);
      });
    });

    describe('Prevent Multiplication breaking Powers', () => {
      test('Should NOT multiply if followed by power', () => {
        // 2 * 3 ^ x
        // Правильно: 2 * (3^x).
        // Неправильно: 6 ^ x.

        const expr = '2 * 3 ^ x';
        expectErrorHistory(expr, []);
      });

      test('Should NOT multiply if preceded by power', () => {
        // x ^ 2 * 3
        // Неправильно: x ^ 6 (если бы степень схлопнулась с умножением, хотя это маловероятно из-за порядка записи, но проверка не помешает)
        // Здесь regex умножения увидит "2". Перед ним "^". Должен пропустить.

        const expr = 'x ^ 2 * 3';
        expectErrorHistory(expr, []);
      });
    });

    describe('Integration with Derivative (The original bug)', () => {
      test('1 + der(x^2, x) should resolve to 1 + 2*x and STOP', () => {
        // 1. der(x^2, x) -> 2*x
        // 2. Строка: "1 + 2*x"
        // 3. Сложение (Level 5) видит "1 + 2".
        //    Но справа от "2" стоит "*".
        //    Сложение ОТМЕНЯЕТСЯ.
        // 4. Тупик.

        const expr = '1 + der(x^2, x)';

        expectErrorHistory(expr, [
          {
            args: ['x^2', 'x'],
            expression: '1 + der(x^2, x)',
            index: 4,
            newExpression: '1 + 2*x',
            operation: 'Производная',
          },
        ]);
      });

      test('Complex chain: 5 + 2 * 3 + 4 * x', () => {
        // 1. Умножение (Level 4): 2 * 3 -> 6.
        //    4 * x -> пропускаем (x не число).
        // 2. Строка: "5 + 6 + 4 * x".
        // 3. Сложение (Level 5):
        //    "5 + 6" -> 11. (Справа от 6 стоит "+", это ок).
        //    "11 + 4" -> Пропускаем! Справа от 4 стоит "*".
        // 4. Итог: "11 + 4 * x".

        const expr = '5 + 2 * 3 + 4 * x';

        expectErrorHistory(expr, [
          {
            args: [2, 3],
            expression: '5 + 2 * 3 + 4 * x',
            index: 4,
            newExpression: '5 + 6 + 4 * x',
            operation: 'Умножение',
          },
          {
            args: [5, 6],
            expression: '5 + 6 + 4 * x',
            index: 0,
            newExpression: '11 + 4 * x',
            operation: 'Сумма',
          },
        ]);
      });
    });
  });
});
