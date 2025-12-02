import { applyOperation, sum, sub, mul, div, mod, pow, sqrt, log, sin } from './operators';

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
});
