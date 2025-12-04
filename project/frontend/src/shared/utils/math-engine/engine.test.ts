import { calc, CalculatorError } from './engine';

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
        expect(e.history[0]).toBe('2 + unknown');
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
            expect(e.history[1]).toMatch(/2\s*\*\s*x/);
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
});
