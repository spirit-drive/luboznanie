import DOMPurify from 'dompurify';

export const sanitizeFn = (dirty: string): string => {
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(dirty, {
      FORBID_ATTR: ['style', 'on*'],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp|mailto|data):|[^a-z]|$)/i,
    });
  }
  return dirty;
};
