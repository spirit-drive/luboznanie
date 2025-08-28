export const deepCopy = <T>(obj: T): T => {
  // Обработка null и undefined
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Обработка примитивных типов (они не требуют копирования)
  if (typeof obj !== 'object') {
    return obj;
  }

  // Обработка Date
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  // Обработка Array
  if (Array.isArray(obj)) {
    return obj.map((item) => deepCopy(item)) as T;
  }

  // Обработка Map
  if (obj instanceof Map) {
    return new Map(Array.from(obj.entries()).map(([key, value]) => [deepCopy(key), deepCopy(value)])) as T;
  }

  // Обработка Set
  if (obj instanceof Set) {
    return new Set(Array.from(obj.values()).map((value) => deepCopy(value))) as T;
  }

  // Обработка обычных объектов
  const copy = Object.create(Object.getPrototypeOf(obj));
  for (const [key, value] of Object.entries(obj)) {
    copy[key] = deepCopy(value);
  }
  return copy;
};
