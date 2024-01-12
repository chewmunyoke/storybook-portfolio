export const getStyleTranslateX = (element: HTMLElement) => {
  if (element) {
    const str = element.style.transform;
    if (str.includes('translateX')) {
      return Number(String(str).replace(/[^-?\d.]/g, ''));
    }
  }
  return 0;
};

export const setStyleTranslateX = (element: HTMLElement, value: number) => {
  if (element) {
    element.style.setProperty('transform', `translateX(${value}px)`);
  }
};

export const addItemToArray = (array: number[], item: number) => {
  if (!array.includes(item)) {
    array.push(item);
  }
};

export const removeItemFromArray = (array: number[], item: number) => {
  const index = array.findIndex((i) => i === item);
  if (index > -1) {
    array.splice(index, 1);
  }
};
