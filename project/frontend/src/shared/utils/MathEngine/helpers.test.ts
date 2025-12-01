import { findFirstExpression } from '@/shared/utils/MathEngine/helpers';

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
