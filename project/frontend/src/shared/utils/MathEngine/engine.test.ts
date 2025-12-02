import { createCalc, CalculatorError } from './engine';
import * as ops from './operators';

// Собираем конфиг из твоих операторов
// Уровень 0: Высшие функции и константы (pi, e, производная, функции)
const levelFunctions = [ops.sin, ops.cos, ops.pi, ops.e, ops.der];
// Уровень 1: Степени, корни
const levelPowers = [ops.pow, ops.sqrt];
// Уровень 2: Умножение, деление
const levelMulDiv = [ops.mul, ops.div];
// Уровень 3: Сложение, вычитание
const levelSumSub = [ops.sum, ops.sub];

const config = [levelFunctions, levelPowers, levelMulDiv, levelSumSub];

const calc = createCalc(config);

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
});
