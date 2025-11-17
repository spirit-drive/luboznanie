export const PREVENT_TIMEOUT = 100;

export const createPreventMultiAction =
  <T extends Event>({
    alwaysHandler,
    isEnable,
    timeout = PREVENT_TIMEOUT,
  }: {
    // если возвращает true - прерываем
    alwaysHandler?: (event: T, ...args: unknown[]) => boolean;
    isEnable?: (event: T) => void;
    timeout?: number;
  }) =>
  (action: (event: T, ...args: unknown[]) => void) => {
    let timerId: number = 0;
    let timestamp = 0;

    return (event: T, ...args: unknown[]) => {
      if (alwaysHandler?.(event, ...args)) return;
      const diff = Date.now() - timestamp;

      if (diff >= timeout) {
        timestamp = Date.now();

        if (isEnable?.(event)) {
          timerId = setTimeout(() => action(event, ...args), timeout) as number;
        } else {
          action(event, ...args);
        }
        return;
      }

      clearTimeout(timerId);
    };
  };
