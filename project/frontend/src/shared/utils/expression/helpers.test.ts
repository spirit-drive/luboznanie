import { findFirstExpression, findFirstBrackets } from '@/shared/utils/expression/helpers';

describe('helpers', () => {
  describe('findFirstExpression', () => {
    // --- Базовые Сценарии ---

    test('1. Должен найти простое выражение в начале строки', () => {
      const input = '{{ 10 + 5 }}';
      const res = findFirstExpression(input);

      expect(res).toEqual({
        expression: '10 + 5',
        start: 0,
        end: 12,
      });
      // "вырезаем" найденное, заменяем на *, остальное должно совпасть
      expect(`${input.slice(0, res!.start)}*${input.slice(res!.end)}`).toBe(`*`);
    });

    test('2. Должен найти первое выражение, игнорируя последующие', () => {
      const input = 'Задача: {{ 1 }} + {{ 2 }}';
      const res = findFirstExpression(input);

      expect(res).toEqual({
        expression: '1',
        start: 8,
        end: 15,
      });
      expect(`${input.slice(0, res!.start)}*${input.slice(res!.end)}`).toBe(`Задача: * + {{ 2 }}`);
    });

    // --- Обработка Вложенности ---

    test('3. Должен корректно обрабатывать вложенные скобки (находит самое глубокое)', () => {
      const input = 'Задача: {{ 10 + {{ 5 / 2 }} }}';
      const res = findFirstExpression(input);

      expect(res).toEqual({
        expression: '5 / 2',
        start: 16,
        end: 27,
      });
      expect(`${input.slice(0, res!.start)}*${input.slice(res!.end)}`).toBe(`Задача: {{ 10 + * }}`);
    });

    test('4. Должен обрабатывать множественную вложенность', () => {
      const input = '{{ X + {{ Y / {{ Z }} }} }}';
      const res = findFirstExpression(input);

      expect(res).toEqual({
        expression: 'Z',
        start: 14,
        end: 21,
      });
      expect(`${input.slice(0, res!.start)}*${input.slice(res!.end)}`).toBe(`{{ X + {{ Y / * }} }}`);
    });

    // --- Обработка Одинарных Скобок (Множеств) ---

    test('5. Должен игнорировать одинарные скобки внутри выражения', () => {
      const input = 'Задача: {{{1, 2, 3} + 5 }}';
      const res = findFirstExpression(input);

      expect(res).toEqual({
        expression: '{1, 2, 3} + 5',
        start: 8,
        end: 26,
      });
      expect(`${input.slice(0, res!.start)}*${input.slice(res!.end)}`).toBe(`Задача: *`);
    });

    test('5.1 Должен находить двойные скобки внутри тройных (структура {{...}})', () => {
      const input = 'Задача: {{{1, 2, 3}} + 5 }';
      const res = findFirstExpression(input);

      expect(res).toEqual({
        expression: '1, 2, 3',
        start: 9,
        end: 20,
      });
      // Здесь мы ожидаем, что вырежется внутренняя часть: { * + 5 }
      expect(`${input.slice(0, res!.start)}*${input.slice(res!.end)}`).toBe(`Задача: {* + 5 }`);
    });

    test('6. Должен игнорировать одинарные скобки вокруг двойных', () => {
      const input = 'Задача: {{{ 1 }}}';
      const res = findFirstExpression(input);

      expect(res).toEqual({
        expression: '1',
        start: 9,
        end: 16,
      });
      expect(`${input.slice(0, res!.start)}*${input.slice(res!.end)}`).toBe(`Задача: {*}`);
    });

    test('7. Должен игнорировать одинарные скобки, не являющиеся частью выражения', () => {
      const input = 'Задача: {A} + {{ B + 1 }} - {C}';
      const res = findFirstExpression(input);

      expect(res).toEqual({
        expression: 'B + 1',
        start: 14,
        end: 25,
      });
      expect(`${input.slice(0, res!.start)}*${input.slice(res!.end)}`).toBe(`Задача: {A} + * - {C}`);
    });

    // --- Краевые и Ошибочные Сценарии ---

    test('8. Должен вернуть null, если нет закрывающей скобки', () => {
      const input = 'Задача: {{ 10 * 5 ';
      expect(findFirstExpression(input)).toBeNull();
    });

    test('9. Должен вернуть null для пустой строки', () => {
      const input = '';
      expect(findFirstExpression(input)).toBeNull();
    });

    test('10. Должен вернуть null, если есть только одинарные скобки', () => {
      const input = 'Задача: {A} + {B}';
      expect(findFirstExpression(input)).toBeNull();
    });

    test('11. Должен обработать выражение с пробелами и переводом строки', () => {
      const input = 'Тест: {{ \n100\n }} Конец.';
      const res = findFirstExpression(input);
      expect(res).toEqual({
        expression: '100',
        start: 6,
        end: 17,
      });
      expect(`${input.slice(0, res!.start)}*${input.slice(res!.end)}`).toBe(`Тест: * Конец.`);
    });

    test('12. Должен вернуть null, если внутренняя структура нарушена (незакрытая скобка)', () => {
      const input = 'Тест: {{ 100 } }} Конец.';
      expect(findFirstExpression(input)).toBeNull();
    });
  });

  describe('findFirstBrackets', () => {
    // --- Базовые Сценарии ---

    test('1. Должен найти простое выражение в скобках', () => {
      const input = '2 * (10 + 5)';
      const res = findFirstBrackets(input);

      expect(res).toEqual({
        expression: '10 + 5',
        start: 4,
        end: 12,
      });
      expect(`${input.slice(0, res!.start)}*${input.slice(res!.end)}`).toBe(`2 * *`);
    });

    test('2. Должен найти первую группу скобок в последовательности', () => {
      const input = '(a) + (b)';
      const res = findFirstBrackets(input);

      expect(res).toEqual({
        expression: 'a',
        start: 0,
        end: 3,
      });
      expect(`${input.slice(0, res!.start)}*${input.slice(res!.end)}`).toBe(`* + (b)`);
    });

    // --- Обработка Вложенности (Самое важное) ---

    test('3. Должен находить самые глубокие (вложенные) скобки', () => {
      // Логика функции такова, что она ищет скобки, внутри которых НЕТ других скобок.
      // Поэтому в выражении (1 + (2 - 3)) она найдет (2 - 3)
      const input = 'Math: (1 + (2 - 3))';
      const res = findFirstBrackets(input);

      expect(res).toEqual({
        expression: '2 - 3',
        start: 11,
        end: 18,
      });
      expect(`${input.slice(0, res!.start)}*${input.slice(res!.end)}`).toBe(`Math: (1 + *)`);
    });

    test('4. Должен обрабатывать множественную вложенность', () => {
      const input = '((a + (b * c)) / d)';
      const res = findFirstBrackets(input);

      // Самое глубокое выражение: (b * c)
      expect(res).toEqual({
        expression: 'b * c',
        start: 6,
        end: 13,
      });
      expect(`${input.slice(0, res!.start)}*${input.slice(res!.end)}`).toBe(`((a + *) / d)`);
    });

    // --- Специфичные случаи ---

    test('5. Должен корректно обрабатывать пустые скобки', () => {
      const input = 'func()';
      const res = findFirstBrackets(input);

      expect(res).toBeNull();
    });

    test('6. Должен обрабатывать скобки с пробелами и переносами строк', () => {
      const input = '(\n  text  \n)';
      const res = findFirstBrackets(input);

      expect(res).toEqual({
        expression: 'text',
        start: 0,
        end: 12,
      });
      expect(`${input.slice(0, res!.start)}*${input.slice(res!.end)}`).toBe(`*`);
    });

    test('7. Должен игнорировать скобки, если они часть текста (но это зависит от того, как вы парсите)', () => {
      // В текущей реализации функции она "глупая" и не знает контекста,
      // поэтому просто найдет первые валидные скобки.
      const input = 'text (valid) text';
      const res = findFirstBrackets(input);

      expect(res).toEqual({
        expression: 'valid',
        start: 5,
        end: 12,
      });
    });

    // --- Краевые и Ошибочные Сценарии ---

    test('8. Должен вернуть null, если нет закрывающей скобки', () => {
      const input = '(1 + 2';
      expect(findFirstBrackets(input)).toBeNull();
    });

    test('9. Должен вернуть null, если нет открывающей скобки', () => {
      const input = '1 + 2)';
      expect(findFirstBrackets(input)).toBeNull();
    });

    test('10. Должен вернуть null для пустой строки', () => {
      const input = '';
      expect(findFirstBrackets(input)).toBeNull();
    });

    test('11. Частично некорректная вложенность (находит валидную часть)', () => {
      // Важно: Регулярка найдет (2+3), так как это валидная пара,
      // игнорируя внешнюю незакрытую скобку.
      const input = '(1 + (2 + 3)';
      const res = findFirstBrackets(input);

      expect(res).toEqual({
        expression: '2 + 3',
        start: 5,
        end: 12,
      });
      expect(`${input.slice(0, res!.start)}*${input.slice(res!.end)}`).toBe(`(1 + *`);
    });

    test('12. Некорректный порядок скобок', () => {
      const input = ') a + b (';
      expect(findFirstBrackets(input)).toBeNull();
    });
  });
});
