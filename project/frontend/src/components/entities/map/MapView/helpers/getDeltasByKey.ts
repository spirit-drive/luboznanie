export const getDeltasByKey = (event: KeyboardEvent) => {
  let deltaX = 0;
  let deltaY = 0;
  const shift = event.shiftKey ? 10 : 1;

  switch (event.key) {
    case 'ArrowUp':
      deltaY = -shift;
      break;
    case 'ArrowDown':
      deltaY = shift;
      break;
    case 'ArrowLeft':
      deltaX = -shift;
      break;
    case 'ArrowRight':
      deltaX = shift;
      break;
    default:
      return {
        deltaX,
        deltaY,
      };
  }

  return {
    deltaX,
    deltaY,
  };
};
