import DOMPurify from 'dompurify';  
  
  export const sanitizeFn = (dirty: string): string => {
    return DOMPurify.sanitize(dirty);
  };