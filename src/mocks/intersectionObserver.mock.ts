// Reference: https://stackoverflow.com/a/76220429

type ObserverId = string;
const intersectionObserverInstances: Record<
  ObserverId,
  MockIntersectionObserver
> = {};
const subjects: Record<ObserverId, HTMLElement[]> = {};

const generateUniqueId = () => Math.random().toString(36).slice(-10);

export default class MockIntersectionObserver {
  id: ObserverId;
  isIntersecting: boolean;
  callback: (entries: Array<{ target: HTMLElement }>) => unknown;

  constructor(callback: () => unknown) {
    this.id = generateUniqueId();
    this.isIntersecting = false;
    this.callback = callback;
    intersectionObserverInstances[this.id] = this;
  }

  trigger(subjects: HTMLElement[], options: Record<string, any>) {
    this.callback(
      subjects.map((target) => ({
        target,
        ...options,
      }))
    );
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

export const triggerIntersectionObserver = (
  options: Record<string, any> = {}
) =>
  Object.keys(intersectionObserverInstances).forEach((key) => {
    if (subjects[key]) {
      intersectionObserverInstances[key].trigger(subjects[key], options);
    }
  });
