export const escapeSpecialSymbolsMain = (value: string): string | never => {
  if (/^[[\\^$.|?*+()/]$/.test(value)) return `\\${value}`;
  return value;
};

export const escapeSpecialSymbolsString = (value: string): string =>
  (value || '').split('').map(escapeSpecialSymbolsMain).join('');

const HIDDEN_SYMBOL = "'@@@'";

export const createExpressionFinder = (
  openToken: string,
  closeToken: string,
  params?: { beforeRegExpSymbol?: string },
) => {
  const uniqOpenToken = [...new Set(openToken.split('')).values()].join('');
  const uniqCloseToken = [...new Set(closeToken.split('')).values()].join('');
  const before = params?.beforeRegExpSymbol ? params.beforeRegExpSymbol : '';

  const mainRegexp = new RegExp(
    `${before}${escapeSpecialSymbolsString(openToken)}[^${openToken}${closeToken}]*${escapeSpecialSymbolsString(closeToken)}`,
  );
  const controllRegexp = new RegExp(
    `${before}${escapeSpecialSymbolsString(openToken)}.*${escapeSpecialSymbolsString(closeToken)}`,
  );
  const singleRegexp = new RegExp(
    `${before}${escapeSpecialSymbolsString(uniqOpenToken)}[^${uniqOpenToken}${uniqCloseToken}]*${escapeSpecialSymbolsString(uniqCloseToken)}`,
  );

  const clear = (text: string): string => {
    return text.replace(openToken, '').replace(closeToken, '').trim();
  };

  const mainFn = (text: string) => {
    if (mainRegexp.test(text)) {
      const match = text.match(mainRegexp)!;
      const _text = match[0];
      return { expression: clear(_text), start: match.index!, end: _text.length + match.index };
    }

    return null;
  };

  return (text: string): null | { expression: string; start: number; end: number } => {
    if (!text) return null;

    const res = mainFn(text);
    if (res) return res;

    if (controllRegexp.test(text) && singleRegexp.test(text)) {
      const match = text.match(singleRegexp)!;
      const textInSingle = match[0];
      const hidden = { expression: textInSingle, start: match.index!, end: textInSingle.length + match.index };
      const rawText = `${text.slice(0, match.index)}${HIDDEN_SYMBOL}${text.slice(match.index + textInSingle.length)}`;
      const res = mainFn(rawText);
      if (res) {
        const expression = res.expression.replace(HIDDEN_SYMBOL, hidden.expression);
        return {
          expression,
          start: res.start,
          end: res.end + textInSingle.length - HIDDEN_SYMBOL.length,
        };
      }
    }

    return null;
  };
};

// Экспортируем готовую функцию для использования
export const findFirstExpression = createExpressionFinder('{{', '}}');
export const findFirstBrackets = createExpressionFinder('(', ')', { beforeRegExpSymbol: '\\B' });
