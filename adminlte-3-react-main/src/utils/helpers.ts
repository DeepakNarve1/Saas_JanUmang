export const sleep = (time: number) =>
  new Promise((res) => setTimeout(res, time));

export const calculateWindowSize = (windowWidth: number) => {
  if (windowWidth >= 1200) {
    return "lg";
  }
  if (windowWidth >= 992) {
    return "md";
  }
  if (windowWidth >= 768) {
    return "sm";
  }
  return "xs";
};

export const setWindowClass = (classList: string) => {
  if (typeof document !== "undefined") {
    const root = document.body;
    if (root) {
      root.className = classList;
    }
  }
};

export const addWindowClass = (classList: string) => {
  if (typeof document !== "undefined") {
    const root = document.body;
    if (root) {
      root.classList.add(classList);
    }
  }
};

export const removeWindowClass = (classList: string) => {
  if (typeof document !== "undefined") {
    const root = document.body;
    if (root) {
      root.classList.remove(classList);
    }
  }
};

export const scrollbarVisible = (element: any) => {
  return element.scrollHeight > element.clientHeight;
};
