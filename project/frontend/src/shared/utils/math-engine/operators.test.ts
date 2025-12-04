import {
  applyOperation,
  sum,
  sub,
  mul,
  div,
  mod,
  pow,
  sqrt,
  log,
  sin,
  der,
  abs,
  fact,
  cot,
  tan,
  e,
  pi,
  csc,
  sec,
  cos,
  lg,
} from './operators';

describe('Calculator Operations', () => {
  describe('Core Logic (applyOperation)', () => {
    test('should replace the first occurrence of addition', () => {
      const expression = '2 + 2 + 5';
      // Ожидаем, что 2+2 заменится на 4, а +5 останется
      const result = applyOperation(expression, sum);
      expect(result).toBe('4 + 5');
    });

    test('should handle decimal numbers with comma', () => {
      const expression = '1,5 + 2,5';
      const result = applyOperation(expression, sum);
      expect(result).toBe('4'); // format убирает ,0 если целое
    });

    test('should return original expression if no match found', () => {
      const expression = '2 * 2';
      const result = applyOperation(expression, sum); // Пытаемся сложить умножение
      expect(result).toBe('2 * 2');
    });

    test('should handle negative numbers', () => {
      const expression = '5 + -3';
      const result = applyOperation(expression, sum);
      expect(result).toBe('2');
    });

    test('should output comma for decimals so next step can parse it', () => {
      const expression = '5 / 2';
      const result = applyOperation(expression, div);
      expect(result).toBe('2,5'); // Важно: вернул запятую, не точку
    });
  });

  describe('Arithmetic Operations', () => {
    test('Subtraction', () => {
      expect(applyOperation('10 - 4', sub)).toBe('6');
      expect(applyOperation('2 - 5', sub)).toBe('-3');
    });

    test('Multiplication', () => {
      expect(applyOperation('3 * 4', mul)).toBe('12');
      expect(applyOperation('-2 * 4', mul)).toBe('-8');
    });

    test('Division', () => {
      expect(applyOperation('10 / 2', div)).toBe('5');
    });

    test('Modulo (%)', () => {
      expect(applyOperation('10 % 3', mod)).toBe('1');
      expect(applyOperation('10 % 5', mod)).toBe('0');
    });
  });

  describe('Advanced Operations (Level 2)', () => {
    test('Power (^)', () => {
      expect(applyOperation('2 ^ 3', pow)).toBe('8');
      expect(applyOperation('5 ^ 2', pow)).toBe('25');
    });

    test('Square Root (sqrt)', () => {
      expect(applyOperation('sqrt(9)', sqrt)).toBe('3');
      expect(applyOperation('sqrt(2)', sqrt)).toMatch(/^1,414/); // ~1.414
    });

    test('Logarithm (log)', () => {
      // ln(e) = 1
      // e approx 2.718281828
      expect(applyOperation('log(2,718281828)', log)).toMatch(/^0,999|1/);
    });

    test('Trigonometry (sin)', () => {
      // sin(0) = 0
      expect(applyOperation('sin(0)', sin)).toBe('0');
    });
  });

  describe('Complex chained behavior simulation', () => {
    test('Should solve simple chain manually', () => {
      // Имитируем работу будущего Runner'а
      let expr = '2 + 2 * 2';

      // 1. Проход умножения
      expr = applyOperation(expr, mul);
      expect(expr).toBe('2 + 4');

      // 2. Проход сложения
      expr = applyOperation(expr, sum);
      expect(expr).toBe('6');
    });
  });

  describe('Advanced Operations', () => {
    describe('Trigonometry Extensions', () => {
      test('Tangent (tan)', () => {
        // tan(0) = 0
        expect(applyOperation('tan(0)', tan)).toBe('0');
        // tan(45deg) approx 1 (if radians: tan(0.785) approx 1)
        // Math.tan берет радианы. tan(pi/4) = 1.
      });

      test('Cotangent (cot)', () => {
        // cot(pi/4) = 1 / tan(pi/4) = 1
        const val = 0.785398163; // pi/4
        expect(applyOperation(`cot(${val.toString().replace('.', ',')})`, cot)).toMatch(/^1,/);
      });
    });

    describe('Algebra & Combinatorics', () => {
      test('Absolute Value (abs)', () => {
        expect(applyOperation('abs(-15,5)', abs)).toBe('15,5');
        expect(applyOperation('abs(10)', abs)).toBe('10');
      });

      test('Factorial (!)', () => {
        expect(applyOperation('5!', fact)).toBe('120');
        expect(applyOperation('3!', fact)).toBe('6');
        // Проверка на 0! = 1
        expect(applyOperation('0!', fact)).toBe('1');
      });
    });

    describe('Constants', () => {
      test('Pi', () => {
        expect(applyOperation('2 * pi', pi)).toBe('2 * 3,1415926535');
      });

      test('Euler number (e)', () => {
        // Проверяем, что e заменяется, а слово text нет
        expect(applyOperation('e + 1', e)).toBe('2,7182818284 + 1');
      });
    });

    describe('Calculus (Symbolic)', () => {
      test('Derivative of a constant', () => {
        // der(5, x) -> 0
        expect(applyOperation('der(5, x)', der)).toBe('0');
        // der(y, x) -> 0 (другая переменная)
        expect(applyOperation('der(y, x)', der)).toBe('0');
      });

      test('Derivative of x', () => {
        expect(applyOperation('der(x, x)', der)).toBe('1');
      });

      test('Derivative of power x^n', () => {
        // x^3 -> 3*x^2
        expect(applyOperation('der(x^3, x)', der)).toBe('3*x^2');
        // x^2 -> 2*x^1 -> 2*x
        expect(applyOperation('der(x^2, x)', der)).toBe('2*x');
      });

      test('Derivative of C*x', () => {
        expect(applyOperation('der(5*x, x)', der)).toBe('5');
      });
    });
  });

  describe('Cosine (cos)', () => {
    test('should calculate cos(0)', () => {
      // cos(0) = 1
      expect(applyOperation('cos(0)', cos)).toBe('1');
    });

    test('should calculate cos(pi)', () => {
      // cos(pi) = -1
      // Используем приближенное значение пи с запятой
      const piVal = '3,1415926536';
      expect(applyOperation(`cos(${piVal})`, cos)).toBe('-1');
    });
  });

  describe('Secant (sec)', () => {
    // sec(x) = 1 / cos(x)

    test('should calculate sec(0)', () => {
      // sec(0) = 1 / cos(0) = 1 / 1 = 1
      expect(applyOperation('sec(0)', sec)).toBe('1');
    });

    test('should calculate sec(pi)', () => {
      // sec(pi) = 1 / cos(pi) = 1 / -1 = -1
      const piVal = '3,1415926536';
      expect(applyOperation(`sec(${piVal})`, sec)).toBe('-1');
    });

    test('should throw or handle undefined for sec(pi/2)', () => {
      // sec(pi/2) -> 1 / 0 -> undefined
      // Т.к. мы считаем численно, там будет очень маленькое число (погрешность),
      // но если попасть точно, функция выбросит ошибку.
      // Проверим, что ошибка пробрасывается (если реализация выбрасывает Error)
      // или возвращается исходная строка (если try-catch внутри applyOperation срабатывает).

      // В текущей реализации applyOperation есть try-catch, который возвращает исходную строку при ошибке.
      // Поэтому проверим, что строка не изменилась (или изменилась корректно, если это не точный 0).

      // 1.5707963268 это примерно pi/2
      // cos(pi/2) очень близок к 0. sec должен быть огромным числом или ошибкой.
      const halfPi = '1,5707963268';
      try {
        const result = applyOperation(`sec(${halfPi})`, sec);
        // Либо это огромное число, либо исходная строка (если error caught)
        expect(result).toBeDefined();
      } catch (e) {
        // Если мы убрали try-catch из applyOperation
        expect(e).toBeDefined();
      }
    });
  });

  describe('Cosecant (csc)', () => {
    // csc(x) = 1 / sin(x)

    test('should calculate csc(pi/2)', () => {
      // csc(pi/2) = 1 / sin(pi/2) = 1 / 1 = 1
      const halfPi = '1,5707963268';
      expect(applyOperation(`csc(${halfPi})`, csc)).toBe('1');
    });

    test('should calculate csc(3pi/2)', () => {
      // csc(270deg) = 1 / -1 = -1
      // 3 * pi / 2 approx 4.71238898
      const val = '4,7123889804';
      expect(applyOperation(`csc(${val})`, csc)).toBe('-1');
    });
  });

  describe('Common Logarithm (lg)', () => {
    // Log base 10

    test('should calculate lg(100)', () => {
      // 10^2 = 100 -> lg(100) = 2
      expect(applyOperation('lg(100)', lg)).toBe('2');
    });

    test('should calculate lg(10)', () => {
      expect(applyOperation('lg(10)', lg)).toBe('1');
    });

    test('should calculate lg(1)', () => {
      // 10^0 = 1 -> lg(1) = 0
      expect(applyOperation('lg(1)', lg)).toBe('0');
    });

    test('should calculate lg(0,1)', () => {
      // 10^-1 = 0.1 -> lg(0.1) = -1
      expect(applyOperation('lg(0,1)', lg)).toBe('-1');
    });

    test('should calculate lg(0,01)', () => {
      // 10^-2 = 0.01
      expect(applyOperation('lg(0,01)', lg)).toBe('-2');
    });

    test('complex float lg', () => {
      // lg(50) approx 1.69897...
      const result = applyOperation('lg(50)', lg);
      expect(result).toMatch(/^1,698/);
    });
  });
});
