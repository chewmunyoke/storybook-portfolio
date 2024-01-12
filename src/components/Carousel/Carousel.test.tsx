import { act } from 'react-dom/test-utils';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';

import MockIntersectionObserver, {
  triggerIntersectionObserver,
} from '../../mocks/intersectionObserver.mock';
import MockResizeObserver, {
  triggerResizeObserver,
} from '../../mocks/resizeObserver.mock';
import {
  CAROUSEL_CLASS_NAMES,
  DEFAULT_ITEM_WIDTH,
  GAP_WIDTH,
  DEFAULT_AUTOPLAY_INTERVAL,
  SCROLL_DISTANCE,
} from './constants';
import Carousel from './index';
import type { CarouselProps } from './index';
import { getStyleTranslateX, setStyleTranslateX } from './utils';

jest.mock('lodash', () => ({
  debounce: jest.fn((func) => func),
}));

describe('Carousel', () => {
  const totalItems = 20;
  const itemsPerPage = 3;
  const totalPages = 7;
  const clientWidth = (DEFAULT_ITEM_WIDTH + GAP_WIDTH) * itemsPerPage;
  const scrollWidth =
    DEFAULT_ITEM_WIDTH * totalItems + GAP_WIDTH * (totalItems - 1);

  const defaultProps: CarouselProps = {
    id: 'carousel',
    children: [...Array(totalItems)].map((_, index) => (
      <a key={index} href={`/page-${index}`}>{`Item ${index}`}</a>
    )),
    nextButtonLabel: 'Next',
    prevButtonLabel: 'Previous',
    pauseButtonLabel: 'Pause autoplay',
    resumeButtonLabel: 'Resume autoplay',
    paginationLabel: 'Pagination for carousel',
    paginationIndicatorLabel: 'Page %s of %s in carousel',
  };

  const renderCarousel = (props: Partial<CarouselProps> = {}) => {
    const view = render(<Carousel {...defaultProps} {...props} />);
    const { baseElement } = view;
    const container = baseElement.querySelector(
      `.${CAROUSEL_CLASS_NAMES.LIST_CONTAINER}`
    ) as HTMLDivElement;
    const list = baseElement.querySelector(
      `.${CAROUSEL_CLASS_NAMES.LIST}`
    ) as HTMLUListElement;
    const scrollbarTrack = baseElement.querySelector(
      `.${CAROUSEL_CLASS_NAMES.SCROLLBAR_TRACK}`
    ) as HTMLDivElement;

    // if snapType = 'page', then itemsPerPage = 3 & totalPages = 4
    // if snapType = 'item', then itemsPerPage = 3 & totalPages = 8
    Object.defineProperty(container, 'clientWidth', {
      writable: true,
      value: clientWidth,
    });
    Object.defineProperty(list, 'clientWidth', {
      writable: true,
      value: scrollWidth,
    });
    if (scrollbarTrack) {
      Object.defineProperty(scrollbarTrack, 'clientWidth', {
        writable: true,
        value: clientWidth,
      });
    }

    setStyleTranslateX(list, 0);
    act(() => {
      triggerResizeObserver();
    });

    return view;
  };

  beforeAll(() => {
    Object.defineProperty(global, 'IntersectionObserver', {
      value: MockIntersectionObserver,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'ResizeObserver', {
      value: MockResizeObserver,
      writable: true,
      configurable: true,
    });
  });

  describe('Jest Axe Tests', () => {
    it('should render without throwing accessibility errors', async () => {
      const { container } = renderCarousel();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Snapshot Tests', () => {
    it('should render without throwing errors', () => {
      const { baseElement } = renderCarousel();

      expect(baseElement).toMatchSnapshot();
    });

    it('with title, subtitle and header button', () => {
      const { baseElement } = renderCarousel({
        title: 'Title',
        subtitle: 'Subtitle',
        headerButtonLabel: 'Button',
      });

      expect(baseElement).toMatchSnapshot();
    });

    it('with "isFullWidth" as true', () => {
      const { baseElement } = renderCarousel({
        isFullWidth: true,
      });

      expect(baseElement).toMatchSnapshot();
    });

    it.each<CarouselProps['snapType']>(['item', 'page'])(
      'with snapType="%s"',
      (snapType) => {
        const { baseElement } = renderCarousel({ snapType });

        expect(baseElement).toMatchSnapshot();
      }
    );

    it.each<CarouselProps['paginationType']>([
      'indicator',
      'scrollbar',
      'none',
    ])('with paginationType="%s"', (paginationType) => {
      const { baseElement } = renderCarousel({ paginationType });

      expect(baseElement).toMatchSnapshot();
    });

    it.each<CarouselProps['navButtonPlacement']>([
      'header',
      'body',
      'body-primary',
      'footer',
      'none',
    ])('with navButtonPlacement="%s"', (navButtonPlacement) => {
      const { baseElement } = renderCarousel({ navButtonPlacement });

      expect(baseElement).toMatchSnapshot();
    });
  });

  describe('React Testing Library Tests', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should render children correctly', () => {
      renderCarousel();

      expect(screen.getAllByRole('link')).toHaveLength(
        defaultProps['children'].length
      );
    });

    it('should handle header button click', () => {
      const headerButtonLabel = 'Button';
      const onHeaderButtonClick = jest.fn();
      renderCarousel({
        headerButtonLabel,
        onHeaderButtonClick,
      });

      fireEvent.click(screen.getByRole('button', { name: headerButtonLabel }));

      expect(onHeaderButtonClick).toBeCalledTimes(1);
    });

    it('should handle carousel item click', async () => {
      const { baseElement } = renderCarousel();
      const list = baseElement.querySelector(
        `.${CAROUSEL_CLASS_NAMES.LIST}`
      ) as HTMLUListElement;
      const items = within(list).getAllByRole('link');

      fireEvent.click(items[0]);
    });

    it.each<CarouselProps['paginationType']>(['indicator', 'scrollbar'])(
      'should handle navigation buttons click when paginationType is "%s"',
      (paginationType) => {
        const onNextClick = jest.fn();
        const onPrevClick = jest.fn();
        const { baseElement } = renderCarousel({
          paginationType,
          onNextClick,
          onPrevClick,
        });
        const list = baseElement.querySelector(
          `.${CAROUSEL_CLASS_NAMES.LIST}`
        ) as HTMLUListElement;

        fireEvent.click(
          screen.getByRole('button', {
            name: defaultProps.nextButtonLabel,
          })
        );
        fireEvent.transitionEnd(list);
        expect(onNextClick).toBeCalledTimes(1);

        fireEvent.click(
          screen.getByRole('button', {
            name: defaultProps.prevButtonLabel,
          })
        );
        fireEvent.transitionEnd(list);
        expect(onPrevClick).toBeCalledTimes(1);
      }
    );

    it('should handle pagination indicator click', () => {
      renderCarousel();
      const pagination = screen.getByRole('navigation');
      const indicators = within(pagination).getAllByRole('button');

      indicators.forEach((indicator, index) => {
        if (index === 0) {
          expect(indicator.parentElement).toHaveClass('is-active');
        } else {
          expect(indicator.parentElement).not.toHaveClass('is-active');
        }
      });

      fireEvent.click(indicators[1]);
      indicators.forEach((indicator, index) => {
        if (index === 1) {
          expect(indicator.parentElement).toHaveClass('is-active');
        } else {
          expect(indicator.parentElement).not.toHaveClass('is-active');
        }
      });
    });

    it.each<CarouselProps['paginationType']>(['indicator', 'scrollbar'])(
      'should handle wheel event when paginationType is "%s"',
      (paginationType) => {
        const { baseElement } = renderCarousel({
          paginationType,
        });
        const list = baseElement.querySelector(
          `.${CAROUSEL_CLASS_NAMES.LIST}`
        ) as HTMLUListElement;

        expect(getStyleTranslateX(list)).toEqual(0);

        fireEvent.wheel(list, { deltaX: 100 });

        if (paginationType === 'scrollbar') {
          expect(getStyleTranslateX(list)).toEqual(-100);
        } else {
          expect(getStyleTranslateX(list)).toEqual(0);
        }
      }
    );

    it('should update currentPage if it exceeds totalPages on resize', () => {
      const { baseElement } = renderCarousel();
      const container = baseElement.querySelector(
        `.${CAROUSEL_CLASS_NAMES.LIST_CONTAINER}`
      ) as HTMLDivElement;
      const list = baseElement.querySelector(
        `.${CAROUSEL_CLASS_NAMES.LIST}`
      ) as HTMLUListElement;
      const pagination = screen.getByRole('navigation');
      let indicators = within(pagination).getAllByRole('button');

      // Navigate to the last page
      [...Array(totalPages - 1)].forEach(() => {
        fireEvent.click(
          screen.getByRole('button', {
            name: defaultProps.nextButtonLabel,
          })
        );
        fireEvent.transitionEnd(list);
      });

      expect(indicators.length).toEqual(totalPages);
      expect(indicators[indicators.length - 1].parentElement).toHaveClass(
        'is-active'
      );

      // Resize to a bigger screen
      Object.defineProperty(container, 'clientWidth', {
        writable: true,
        value: clientWidth * 2,
      });
      Object.defineProperty(list, 'clientWidth', {
        writable: true,
        value: scrollWidth * 2,
      });
      act(() => {
        triggerResizeObserver();
      });

      indicators = within(pagination).getAllByRole('button');
      expect(indicators.length).toBeLessThan(totalPages);
      expect(indicators[indicators.length - 1].parentElement).toHaveClass(
        'is-active'
      );
    });

    describe('Autoplay', () => {
      it('should loop carousel items on autoplay', () => {
        const { baseElement } = renderCarousel({
          autoplay: true,
        });
        const list = baseElement.querySelector(
          `.${CAROUSEL_CLASS_NAMES.LIST}`
        ) as HTMLUListElement;

        expect(getStyleTranslateX(list)).toEqual(0);

        [...Array(totalPages)].forEach((_, index) => {
          act(() => {
            jest.advanceTimersByTime(DEFAULT_AUTOPLAY_INTERVAL);
          });

          if (index === totalPages - 1) {
            expect(getStyleTranslateX(list)).toEqual(0);
          } else {
            expect(getStyleTranslateX(list)).toEqual(
              (DEFAULT_ITEM_WIDTH + GAP_WIDTH) *
                (itemsPerPage * (index + 1)) *
                -1
            );
          }
        });
      });

      it('should handle navigation buttons click during autoplay', () => {
        const { baseElement } = renderCarousel({
          autoplay: true,
        });
        const list = baseElement.querySelector(
          `.${CAROUSEL_CLASS_NAMES.LIST}`
        ) as HTMLUListElement;

        expect(getStyleTranslateX(list)).toEqual(0);

        fireEvent.click(
          screen.getByRole('button', {
            name: defaultProps.prevButtonLabel,
          })
        );

        expect(getStyleTranslateX(list)).toEqual(
          (DEFAULT_ITEM_WIDTH + GAP_WIDTH) *
            (itemsPerPage * (totalPages - 1)) *
            -1
        );

        fireEvent.click(
          screen.getByRole('button', {
            name: defaultProps.nextButtonLabel,
          })
        );

        expect(getStyleTranslateX(list)).toEqual(0);
      });

      it('should handle autoplay play/pause button click', () => {
        const onAutoplayButtonClick = jest.fn();
        renderCarousel({
          autoplay: true,
          onAutoplayButtonClick,
        });

        fireEvent.click(
          screen.getByRole('button', {
            name: defaultProps.pauseButtonLabel,
          })
        );
        expect(onAutoplayButtonClick).toBeCalledTimes(1);

        fireEvent.click(
          screen.getByRole('button', {
            name: defaultProps.resumeButtonLabel,
          })
        );
        expect(onAutoplayButtonClick).toBeCalledTimes(2);
      });

      it('should start autoplay when intersecting, and stop when not', () => {
        const { baseElement } = renderCarousel({
          autoplay: true,
        });
        const footer = baseElement.querySelector(
          `.${CAROUSEL_CLASS_NAMES.FOOTER}`
        );

        act(() => {
          triggerIntersectionObserver({ isIntersecting: true });
        });
        expect(footer).toHaveClass(
          `${CAROUSEL_CLASS_NAMES.FOOTER}--is-autoplaying`
        );

        act(() => {
          triggerIntersectionObserver({ isIntersecting: false });
        });
        expect(footer).not.toHaveClass(
          `${CAROUSEL_CLASS_NAMES.FOOTER}--is-autoplaying`
        );
      });

      it('should do nothing on intersection when autoplay is false', () => {
        const { baseElement } = renderCarousel();
        const footer = baseElement.querySelector(
          `.${CAROUSEL_CLASS_NAMES.FOOTER}`
        );

        expect(footer).not.toHaveClass(
          `${CAROUSEL_CLASS_NAMES.FOOTER}--is-autoplaying`
        );

        act(() => {
          triggerIntersectionObserver({ isIntersecting: true });
        });
        expect(footer).not.toHaveClass(
          `${CAROUSEL_CLASS_NAMES.FOOTER}--is-autoplaying`
        );

        act(() => {
          triggerIntersectionObserver({ isIntersecting: false });
        });
        expect(footer).not.toHaveClass(
          `${CAROUSEL_CLASS_NAMES.FOOTER}--is-autoplaying`
        );
      });
    });

    describe('Mouse interaction', () => {
      describe('Carousel', () => {
        it('should handle carousel dragging via mouse left button', () => {
          const { baseElement } = renderCarousel();
          const container = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST_CONTAINER}`
          ) as HTMLDivElement;
          const list = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST}`
          ) as HTMLUListElement;

          // When dragging left does not exceed ITEM_THRESHOLD
          fireEvent.mouseDown(container, { clientX: 100 });
          fireEvent.mouseMove(container, {
            clientX: 0,
          });
          fireEvent.mouseUp(container);

          expect(getStyleTranslateX(list)).toEqual(0);

          // When dragging left exceeds ITEM_THRESHOLD
          fireEvent.mouseDown(container, { clientX: 500 });
          fireEvent.mouseMove(container, {
            clientX: 0,
          });
          fireEvent.mouseUp(container);

          expect(getStyleTranslateX(list)).toEqual(
            (DEFAULT_ITEM_WIDTH + GAP_WIDTH) * itemsPerPage * -1
          );

          // When dragging right does not exceed ITEM_THRESHOLD
          fireEvent.mouseDown(container, { clientX: 0 });
          fireEvent.mouseMove(container, {
            clientX: 100,
          });
          fireEvent.mouseUp(container);

          expect(getStyleTranslateX(list)).toEqual(
            (DEFAULT_ITEM_WIDTH + GAP_WIDTH) * itemsPerPage * -1
          );

          // When dragging right exceeds ITEM_THRESHOLD
          fireEvent.mouseDown(container, { clientX: 0 });
          fireEvent.mouseMove(container, {
            clientX: 500,
          });
          fireEvent.mouseUp(container);

          expect(getStyleTranslateX(list)).toEqual(0);
        });

        it('should not allow carousel dragging via mouse right button', () => {
          const { baseElement } = renderCarousel();
          const container = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST_CONTAINER}`
          ) as HTMLDivElement;
          const list = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST}`
          ) as HTMLUListElement;

          fireEvent.mouseDown(container, {
            button: 2,
            clientX: 500,
          });
          fireEvent.mouseMove(container, {
            clientX: 0,
          });
          fireEvent.mouseUp(container);
          fireEvent.transitionStart(list);

          expect(getStyleTranslateX(list)).toEqual(0);
        });

        it('should not allow carousel dragging if mouse does not start in carousel', () => {
          const { baseElement } = renderCarousel();
          const container = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST_CONTAINER}`
          ) as HTMLDivElement;
          const list = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST}`
          ) as HTMLUListElement;

          fireEvent.mouseMove(container, {
            clientX: 500,
          });
          fireEvent.mouseUp(container);

          expect(getStyleTranslateX(list)).toEqual(0);
        });

        it('should not trigger carousel item link during dragging', async () => {
          const { baseElement } = renderCarousel();
          const container = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST_CONTAINER}`
          ) as HTMLDivElement;
          const list = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST}`
          ) as HTMLUListElement;
          const items = within(list).getAllByRole('link');

          fireEvent.mouseDown(container, {
            clientX: 500,
          });
          fireEvent.mouseMove(container, {
            clientX: 0,
          });
          fireEvent.click(items[0]);
        });

        it('should pause autoplay on mouse enter, and resume on mouse leave', () => {
          const { baseElement } = renderCarousel({
            autoplay: true,
          });
          const container = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST_CONTAINER}`
          ) as HTMLDivElement;
          const pagination = screen.getByRole('navigation');
          const indicators = within(pagination).getAllByRole('button');

          fireEvent.mouseEnter(container);
          expect(indicators[0].parentElement).toHaveClass('is-paused');

          fireEvent.mouseLeave(container);
          expect(indicators[0].parentElement).not.toHaveClass('is-paused');
        });

        it('should do nothing on mouse enter & mouse leave if autoplay is false', () => {
          const { baseElement } = renderCarousel();
          const container = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST_CONTAINER}`
          ) as HTMLDivElement;
          const pagination = screen.getByRole('navigation');
          const indicators = within(pagination).getAllByRole('button');

          fireEvent.mouseEnter(container);
          expect(indicators[0].parentElement).not.toHaveClass('is-paused');

          fireEvent.mouseLeave(container);
          expect(indicators[0].parentElement).not.toHaveClass('is-paused');
        });
      });

      describe('Scrollbar', () => {
        it('should handle scrollbar dragging via mouse left button', () => {
          const { baseElement } = renderCarousel({
            paginationType: 'scrollbar',
          });
          const list = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST}`
          ) as HTMLUListElement;
          const scrollbarThumb = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.SCROLLBAR_THUMB}`
          ) as HTMLDivElement;

          fireEvent.mouseDown(scrollbarThumb, { clientX: 0 });
          fireEvent.mouseMove(scrollbarThumb, {
            clientX: 500,
          });
          fireEvent.mouseUp(scrollbarThumb);
          fireEvent.transitionStart(list);

          expect(getStyleTranslateX(list)).toBeLessThan(0);
          expect(scrollbarThumb).not.toHaveStyle({ left: '0px' });
        });

        it('should not allow scrollbar dragging via mouse right button', () => {
          const { baseElement } = renderCarousel({
            paginationType: 'scrollbar',
          });
          const list = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST}`
          ) as HTMLUListElement;
          const scrollbarThumb = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.SCROLLBAR_THUMB}`
          ) as HTMLDivElement;

          fireEvent.mouseDown(scrollbarThumb, {
            button: 2,
            clientX: 0,
          });
          fireEvent.mouseMove(scrollbarThumb, {
            clientX: 500,
          });
          fireEvent.mouseUp(scrollbarThumb);
          fireEvent.transitionStart(list);

          expect(getStyleTranslateX(list)).toEqual(0);
          expect(scrollbarThumb).toHaveStyle({ left: '0px' });
        });

        it('should not allow scrollbar dragging if mouse does not start in scrollbar thumb', () => {
          const { baseElement } = renderCarousel({
            paginationType: 'scrollbar',
          });
          const list = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST}`
          ) as HTMLUListElement;
          const scrollbarThumb = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.SCROLLBAR_THUMB}`
          ) as HTMLDivElement;

          fireEvent.mouseMove(scrollbarThumb, {
            clientX: 500,
          });
          fireEvent.mouseUp(scrollbarThumb);
          fireEvent.transitionStart(list);

          expect(getStyleTranslateX(list)).toEqual(0);
          expect(scrollbarThumb).toHaveStyle({ left: '0px' });
        });

        it('should handle scrollbar track click', () => {
          const { baseElement } = renderCarousel({
            paginationType: 'scrollbar',
          });
          const list = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST}`
          ) as HTMLUListElement;
          const scrollbarTrack = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.SCROLLBAR_TRACK}`
          ) as HTMLDivElement;
          const scrollbarThumb = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.SCROLLBAR_THUMB}`
          ) as HTMLDivElement;

          fireEvent.click(scrollbarTrack, { clientX: 500 });
          fireEvent.transitionStart(list);

          expect(getStyleTranslateX(list)).toBeLessThan(0);
          expect(scrollbarThumb).not.toHaveStyle({ left: '0px' });
        });
      });
    });

    describe('Touch interaction', () => {
      describe('Carousel items', () => {
        it('should handle carousel dragging via touch', () => {
          const { baseElement } = renderCarousel();
          const container = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST_CONTAINER}`
          ) as HTMLDivElement;
          const list = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST}`
          ) as HTMLUListElement;

          // When dragging left does not exceed ITEM_THRESHOLD
          fireEvent.touchStart(container, {
            changedTouches: [{ pageX: 100 }],
          });
          fireEvent.touchMove(container, {
            changedTouches: [{ pageX: 0 }],
          });
          fireEvent.touchEnd(container);

          expect(getStyleTranslateX(list)).toEqual(0);

          // When dragging left exceeds ITEM_THRESHOLD
          fireEvent.touchStart(container, {
            changedTouches: [{ pageX: 500 }],
          });
          fireEvent.touchMove(container, {
            changedTouches: [{ pageX: 0 }],
          });
          fireEvent.touchEnd(container);

          expect(getStyleTranslateX(list)).toEqual(
            (DEFAULT_ITEM_WIDTH + GAP_WIDTH) * itemsPerPage * -1
          );

          // When dragging right does not exceed ITEM_THRESHOLD
          fireEvent.touchStart(container, {
            changedTouches: [{ pageX: 0 }],
          });
          fireEvent.touchMove(container, {
            changedTouches: [{ pageX: 100 }],
          });
          fireEvent.touchEnd(container);

          expect(getStyleTranslateX(list)).toEqual(
            (DEFAULT_ITEM_WIDTH + GAP_WIDTH) * itemsPerPage * -1
          );

          // When dragging right exceeds ITEM_THRESHOLD
          fireEvent.touchStart(container, {
            changedTouches: [{ pageX: 0 }],
          });
          fireEvent.touchMove(container, {
            changedTouches: [{ pageX: 500 }],
          });
          fireEvent.touchEnd(container);

          expect(getStyleTranslateX(list)).toEqual(0);
        });

        it('should not allow carousel dragging if touch does not start in carousel', () => {
          const { baseElement } = renderCarousel();
          const container = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST_CONTAINER}`
          ) as HTMLDivElement;
          const list = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST}`
          ) as HTMLUListElement;

          fireEvent.touchMove(container, {
            changedTouches: [{ pageX: 500 }],
          });
          fireEvent.touchEnd(container);

          expect(getStyleTranslateX(list)).toEqual(0);
        });
      });

      describe('Scrollbar', () => {
        it('should handle scrollbar dragging via touch', () => {
          const { baseElement } = renderCarousel({
            paginationType: 'scrollbar',
          });
          const list = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST}`
          ) as HTMLUListElement;
          const scrollbarThumb = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.SCROLLBAR_THUMB}`
          ) as HTMLDivElement;

          fireEvent.touchStart(scrollbarThumb, {
            changedTouches: [{ pageX: 0 }],
          });
          fireEvent.touchMove(scrollbarThumb, {
            changedTouches: [{ pageX: 500 }],
          });
          fireEvent.touchEnd(scrollbarThumb);
          fireEvent.transitionStart(list);

          expect(getStyleTranslateX(list)).toBeLessThan(0);
          expect(scrollbarThumb).not.toHaveStyle({ left: '0px' });
        });

        it('should not allow scrollbar dragging if touch does not start in scrollbar thumb', () => {
          const { baseElement } = renderCarousel({
            paginationType: 'scrollbar',
          });
          const list = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST}`
          ) as HTMLUListElement;
          const scrollbarThumb = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.SCROLLBAR_THUMB}`
          ) as HTMLDivElement;

          fireEvent.touchMove(scrollbarThumb, {
            changedTouches: [{ pageX: 500 }],
          });
          fireEvent.touchEnd(scrollbarThumb);
          fireEvent.transitionStart(list);

          expect(getStyleTranslateX(list)).toEqual(0);
          expect(scrollbarThumb).toHaveStyle({ left: '0px' });
        });
      });
    });

    describe('Keyboard navigation', () => {
      describe('Carousel items', () => {
        it('should move focus on carousel items via ArrowLeft & ArrowRight keys, and not move beyond total count', () => {
          const { baseElement } = renderCarousel();
          const list = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST}`
          ) as HTMLUListElement;
          const items = within(list).getAllByRole('link');
          fireEvent.focus(items[0]);

          items.forEach((_, index) => {
            fireEvent.keyDown(list, { key: 'ArrowRight' });
            expect(items[Math.min(index + 1, items.length - 1)]).toHaveFocus();
          });

          items.forEach((_, index) => {
            fireEvent.keyDown(list, { key: 'ArrowLeft' });
            expect(
              items[Math.max(items.length - 1 - index - 1, 0)]
            ).toHaveFocus();
          });
        });

        it('should move focus to first & last carousel items via Home & End keys', () => {
          const { baseElement } = renderCarousel();
          const list = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST}`
          ) as HTMLUListElement;
          const items = within(list).getAllByRole('link');
          fireEvent.focus(items[0]);

          fireEvent.keyDown(list, { key: 'End' });
          expect(items[items.length - 1]).toHaveFocus();

          fireEvent.keyDown(list, { key: 'Home' });
          expect(items[0]).toHaveFocus();
        });

        it('should not move focus on carousel items via other keys', () => {
          const { baseElement } = renderCarousel();
          const list = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST}`
          ) as HTMLUListElement;

          fireEvent.keyDown(list, { key: 'ArrowUp' });
          expect(baseElement).toHaveFocus();

          fireEvent.keyDown(list, { key: 'ArrowDown' });
          expect(baseElement).toHaveFocus();
        });
      });

      describe('Pagination indicators', () => {
        it('should move focus on pagination indicators via ArrowLeft & ArrowRight keys, and not move beyond total count', () => {
          const { baseElement } = renderCarousel({
            snapType: 'item',
          });

          const pagination = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.PAGINATION}`
          ) as HTMLOListElement;
          const indicators = within(pagination).getAllByRole('button');
          fireEvent.focus(indicators[0]);

          indicators.forEach((_, index) => {
            fireEvent.keyDown(pagination, { key: 'ArrowRight' });
            expect(
              indicators[Math.min(index + 1, indicators.length - 1)]
            ).toHaveFocus();
          });

          indicators.forEach((_, index) => {
            fireEvent.keyDown(pagination, { key: 'ArrowLeft' });
            expect(
              indicators[Math.max(indicators.length - 1 - index - 1, 0)]
            ).toHaveFocus();
          });
        });

        it('should move focus to first & last pagination indicators via Home & End keys', () => {
          const { baseElement } = renderCarousel();
          const pagination = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.PAGINATION}`
          ) as HTMLOListElement;
          const indicators = within(pagination).getAllByRole('button');
          fireEvent.focus(indicators[0]);

          fireEvent.keyDown(pagination, { key: 'End' });
          expect(indicators[indicators.length - 1]).toHaveFocus();

          fireEvent.keyDown(pagination, { key: 'Home' });
          expect(indicators[0]).toHaveFocus();
        });

        it('should not move focus on pagination indicators via other keys', () => {
          const { baseElement } = renderCarousel();
          const pagination = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.PAGINATION}`
          ) as HTMLOListElement;

          fireEvent.keyDown(pagination, { key: 'ArrowUp' });
          expect(baseElement).toHaveFocus();

          fireEvent.keyDown(pagination, { key: 'ArrowDown' });
          expect(baseElement).toHaveFocus();
        });
      });

      describe('Scrollbar', () => {
        it('should move scrollbar thumb via ArrowLeft & ArrowRight Keys', () => {
          const { baseElement } = renderCarousel({
            paginationType: 'scrollbar',
          });
          const list = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST}`
          ) as HTMLUListElement;
          const scrollbar = screen.getByRole('scrollbar');
          const scrollbarThumb = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.SCROLLBAR_THUMB}`
          );
          fireEvent.focus(scrollbar);

          fireEvent.keyDown(scrollbar, { key: 'ArrowRight' });
          fireEvent.transitionStart(list);
          expect(getStyleTranslateX(list)).toEqual(SCROLL_DISTANCE * -1);
          expect(scrollbarThumb).not.toHaveStyle({ left: '0px' });

          fireEvent.keyDown(scrollbar, { key: 'ArrowLeft' });
          fireEvent.transitionStart(list);
          expect(getStyleTranslateX(list)).toEqual(0);
          expect(scrollbarThumb).toHaveStyle({ left: '0px' });
        });

        it('should move scrollbar thumb to start & end position via Home & End keys', () => {
          const { baseElement } = renderCarousel({
            paginationType: 'scrollbar',
          });
          const list = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST}`
          ) as HTMLUListElement;
          const scrollbar = screen.getByRole('scrollbar');
          const scrollbarThumb = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.SCROLLBAR_THUMB}`
          );
          fireEvent.focus(scrollbar);

          fireEvent.keyDown(scrollbar, { key: 'End' });
          fireEvent.transitionStart(list);
          expect(getStyleTranslateX(list)).toEqual(
            (DEFAULT_ITEM_WIDTH + GAP_WIDTH) *
              (itemsPerPage * (totalPages - 1)) *
              -1
          );
          expect(scrollbarThumb).not.toHaveStyle({ left: '0px' });

          fireEvent.keyDown(scrollbar, { key: 'Home' });
          fireEvent.transitionStart(list);
          expect(getStyleTranslateX(list)).toEqual(0);
          expect(scrollbarThumb).toHaveStyle({ left: '0px' });
        });

        it('should not move scrollbar thumb via other keys', () => {
          const { baseElement } = renderCarousel({
            paginationType: 'scrollbar',
          });
          const list = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.LIST}`
          ) as HTMLUListElement;
          const scrollbar = screen.getByRole('scrollbar');
          const scrollbarThumb = baseElement.querySelector(
            `.${CAROUSEL_CLASS_NAMES.SCROLLBAR_THUMB}`
          );
          fireEvent.focus(scrollbar);

          fireEvent.keyDown(scrollbar, { key: 'ArrowUp' });
          fireEvent.transitionStart(list);
          expect(scrollbarThumb).toHaveStyle({ left: '0px' });

          fireEvent.keyDown(scrollbar, { key: 'ArrowDown' });
          fireEvent.transitionStart(list);
          expect(scrollbarThumb).toHaveStyle({ left: '0px' });
        });
      });
    });
  });
});
