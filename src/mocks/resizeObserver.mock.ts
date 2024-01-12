// Reference: https://stackoverflow.com/a/76220429

type ObserverId = string;
const resizeObserverInstances: Record<ObserverId, MockResizeObserver> = {};
const subjects: Record<ObserverId, HTMLElement[]> = {};

const generateUniqueId = () => Math.random().toString(36).slice(-10);

export default class MockResizeObserver {
  id: ObserverId;
  callback: (entries: Array<{ target: HTMLElement }>) => unknown;

  constructor(callback: () => unknown) {
    this.id = generateUniqueId();
    this.callback = callback;
    resizeObserverInstances[this.id] = this;
  }

  trigger(subjects: HTMLElement[]) {
    this.callback(subjects.map((target) => ({ target })));
  }

  observe(element: HTMLElement) {
    if (!subjects[this.id]) {
      subjects[this.id] = [];
    }
    subjects[this.id].push(element);
  }

  unobserve(element: HTMLElement) {
    subjects[this.id].splice(subjects[this.id].indexOf(element), 1);
  }

  disconnect() {
    this.callback = () => undefined;
    delete subjects[this.id];
  }
}

export const triggerResizeObserver = () =>
  Object.keys(resizeObserverInstances).forEach((key) => {
    if (subjects[key]) {
      resizeObserverInstances[key].trigger(subjects[key]);
    }
  });
