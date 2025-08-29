export const DOUBLE_TAP_TIMEOUT = 200;

export const createSingleDoubleAction = <T extends Event>({
  alwaysHandler,
  singleHandler,
  doubleHandler,
  doubleActionTimeout = DOUBLE_TAP_TIMEOUT,
}: {
  // если возвращает true - прерываем
  alwaysHandler?: (event: T, ...args: unknown[]) => boolean;
  singleHandler?: (event: T, ...args: unknown[]) => void;
  doubleHandler?: (event: T, ...args: unknown[]) => void;
  doubleActionTimeout?: number;
}) => {
  let timerId: number = 0;
  let timestamp = 0;

  return (event: T, ...args: unknown[]) => {
    if (alwaysHandler?.(event, ...args)) return;

    const diff = Date.now() - timestamp;

    if (diff >= doubleActionTimeout) {
      timestamp = Date.now();

      timerId = setTimeout(() => singleHandler?.(event, ...args), doubleActionTimeout) as number;
      return;
    }

    clearTimeout(timerId);
    doubleHandler?.(event, ...args);
  };
};
