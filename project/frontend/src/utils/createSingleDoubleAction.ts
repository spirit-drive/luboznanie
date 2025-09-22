export const DOUBLE_TAP_TIMEOUT = 300;
export const PREVENT_TIMEOUT = 100;

export const createSingleDoubleAction = <T extends Event>({
  alwaysHandler,
  singleHandler,
  doubleHandler,
  doubleActionTimeout = DOUBLE_TAP_TIMEOUT,
  needPreventFrequent = (event) => event.pointerType === 'touch',
  frequentTimeout = PREVENT_TIMEOUT,
}: {
  // если возвращает true - прерываем
  alwaysHandler?: (event: T, ...args: unknown[]) => boolean;
  singleHandler?: (event: T, ...args: unknown[]) => void;
  doubleHandler?: (event: T, ...args: unknown[]) => void;
  doubleActionTimeout?: number;
  needPreventFrequent?: (event: T) => boolean;
  frequentTimeout?: number;
}) => {
  let timerId: number = 0;
  let timestamp = 0;

  return (event: T, ...args: unknown[]) => {
    if (alwaysHandler?.(event, ...args)) return;

    const diff = Date.now() - timestamp;
    timestamp = Date.now();

    if (diff >= doubleActionTimeout) {
      timerId = setTimeout(() => singleHandler?.(event, ...args), doubleActionTimeout) as number;
      return;
    }

    // Предотвращает частое срабатывание на мобильных устройствах
    if (needPreventFrequent(event) && diff <= frequentTimeout) return;

    clearTimeout(timerId);
    doubleHandler?.(event, ...args);
  };
};
