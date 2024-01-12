import { act } from 'react-dom/test-utils';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';

import { IcHeart } from '../../icons';
import Tabs from './index';
import type { TabsProps } from './types';

Element.prototype.scrollTo = jest.fn();
const addEventListener = jest.spyOn(globalThis, 'addEventListener');
const removeEventListener = jest.spyOn(globalThis, 'removeEventListener');

const tabWidth = 50;
const tabText = 'Tab';
const selectedTabText = 'Selected Tab';
const disabledTabText = 'Disabled Tab';
const tabWithIconText = 'Tab with Icon';
const selectedTabWithIconText = 'Selected Tab with Icon';
const disabledTabWithIconText = 'Disabled Tab with Icon';

const mockTabsData: TabsProps['data'] = [
  {
    label: tabText,
  },
  {
    label: selectedTabText,
    selected: true,
  },
  {
    label: disabledTabText,
    disabled: true,
  },
  {
    icon: <IcHeart />,
    label: tabWithIconText,
  },
  {
    icon: <IcHeart />,
    label: selectedTabWithIconText,
    selected: true,
  },
  {
    icon: <IcHeart />,
    label: disabledTabWithIconText,
    disabled: true,
  },
];

describe('Tabs', () => {
  const setup = (
    testId: string,
    dataLength: number,
    targetPosition: number
  ): HTMLElement => {
    const tabsContainer = screen.getByTestId(`${testId}__tabs-container`);
    Object.defineProperty(tabsContainer, 'scrollWidth', {
      writable: true,
      value: tabWidth * dataLength,
    });
    Object.defineProperty(tabsContainer, 'clientWidth', {
      writable: true,
      value: tabWidth * 2,
    });
    tabsContainer.scrollLeft = targetPosition;
    screen.getAllByRole('tab', { name: /tab/i }).forEach((tab, index) => {
      Object.defineProperty(tab.parentElement, 'clientWidth', {
        writable: true,
        value: tabWidth,
      });
      Object.defineProperty(tab.parentElement, 'offsetLeft', {
        writable: true,
        value: index * tabWidth,
      });
    });
    act(() => {
      globalThis.dispatchEvent(new Event('resize'));
    });
    return tabsContainer;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Jest Axe Tests', () => {
    it('should render without throwing accessibility errors', async () => {
      const { container } = render(<Tabs data={mockTabsData} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Snapshot Tests', () => {
    it('should render without throwing errors', () => {
      const { baseElement } = render(<Tabs data={mockTabsData} />);

      expect(baseElement).toMatchSnapshot();
    });

    it('when hasBottomBorder is true', () => {
      const { baseElement } = render(
        <Tabs data={mockTabsData} hasBottomBorder />
      );

      expect(baseElement).toMatchSnapshot();
    });

    it('when isCentered is true', () => {
      const { baseElement } = render(<Tabs data={mockTabsData} isCentered />);

      expect(baseElement).toMatchSnapshot();
    });

    it('when isFullWidth is true', () => {
      const { baseElement } = render(<Tabs data={mockTabsData} isFullWidth />);

      expect(baseElement).toMatchSnapshot();
    });
  });

  describe('React Testing Library Tests', () => {
    it('should render tabs correctly', () => {
      render(<Tabs data={mockTabsData} />);

      expect(screen.getAllByRole('tab', { name: /tab/i })).toHaveLength(
        mockTabsData.length
      );
    });

    it('should only render a disabled tab as disabled', () => {
      render(<Tabs data={mockTabsData} />);

      const disabledTab = screen.getByRole('tab', {
        name: disabledTabText,
      });
      expect(disabledTab).toBeDisabled();
      expect(disabledTab.parentElement).toHaveClass('bds-is-disabled');

      const notDisabledTab = screen.getByRole('tab', {
        name: tabText,
      });
      expect(notDisabledTab).toBeEnabled();
      expect(notDisabledTab.parentElement).not.toHaveClass('bds-is-disabled');
    });

    it('should only render a selected tab as selected', () => {
      render(<Tabs data={mockTabsData} />);

      const selectedTab = screen.getByRole('tab', {
        name: selectedTabText,
      });
      expect(selectedTab.parentElement).toHaveClass('is-selected');

      const notSelectedTab = screen.getByRole('tab', {
        name: tabText,
      });
      expect(notSelectedTab.parentElement).not.toHaveClass('is-selected');
    });

    it('should render tabs with icon', () => {
      const expectedNumberOfIcons = mockTabsData.filter(
        (tab) => tab.icon
      ).length;
      render(<Tabs data={mockTabsData} />);

      // Test that a tab with icon should have that icon
      const tabWithIcon = screen.getByRole('tab', {
        name: tabWithIconText,
      });
      expect(tabWithIcon).toContainHTML('svg');

      // Test total number of svgs is correct
      const icons = screen.getAllByText('', { selector: 'svg' });
      expect(icons.length).toEqual(expectedNumberOfIcons);
    });

    it('should add event listeners on mount, and remove on unmount', () => {
      const { unmount } = render(<Tabs data={mockTabsData} />);

      expect(addEventListener).toBeCalledWith('resize', expect.any(Function));

      unmount();
      expect(removeEventListener).toBeCalledWith(
        'resize',
        expect.any(Function)
      );
    });

    it('should behave correctly on tab click', () => {
      const clickIndex = 0;
      render(<Tabs data={mockTabsData} />);

      fireEvent.click(screen.getAllByRole('tab')[clickIndex]);
    });

    it('should call onClick prop if provided on tab click', () => {
      const mockOnClick = jest.fn();
      const mockOnTabClick = jest.fn();
      const mockTabData = [
        {
          label: tabText,
          onClick: mockOnClick,
        },
      ];
      const clickIndex = 0;
      render(<Tabs data={mockTabData} onTabClick={mockOnTabClick} />);

      fireEvent.click(screen.getAllByRole('tab')[clickIndex]);

      expect(mockOnClick).toBeCalledTimes(1);
      expect(mockOnTabClick).toBeCalledTimes(1);
      expect(mockOnTabClick).toBeCalledWith(clickIndex);
    });

    it('should behave correctly on arrow button click', () => {
      const testId = 'test';
      render(<Tabs data={mockTabsData} id={testId} />);

      const tabsContainer = setup(testId, mockTabsData.length, tabWidth);

      const scrollTo = jest.spyOn(tabsContainer, 'scrollTo');
      const nextButton = screen.getByLabelText('Next');
      const prevButton = screen.getByLabelText('Previous');
      expect(nextButton).toBeInTheDocument();
      expect(prevButton).toBeInTheDocument();
      expect(scrollTo).toBeCalledTimes(0);

      fireEvent.click(nextButton);
      expect(scrollTo).toBeCalledTimes(1);

      scrollTo.mockClear();
      fireEvent.click(prevButton);
      expect(scrollTo).toBeCalledTimes(1);
    });

    it('should call onClick props if provided on arrow button click', () => {
      const testId = 'test';
      const mockOnNextClick = jest.fn();
      const mockOnPrevClick = jest.fn();
      render(
        <Tabs
          data={mockTabsData}
          id={testId}
          onNextClick={mockOnNextClick}
          onPrevClick={mockOnPrevClick}
        />
      );

      setup(testId, mockTabsData.length, tabWidth);

      const nextButton = screen.getByLabelText('Next');
      const prevButton = screen.getByLabelText('Previous');
      expect(nextButton).toBeInTheDocument();
      expect(prevButton).toBeInTheDocument();
      expect(mockOnNextClick).toBeCalledTimes(0);
      expect(mockOnPrevClick).toBeCalledTimes(0);

      fireEvent.click(nextButton);
      expect(mockOnNextClick).toBeCalledTimes(1);

      fireEvent.click(prevButton);
      expect(mockOnPrevClick).toBeCalledTimes(1);
    });

    describe('Accessibility', () => {
      it.skip('A11y: icon in tabs should be hidden to screen readers', () => {
        render(<Tabs data={mockTabsData} />);

        screen.getAllByText('', { selector: 'svg' }).forEach((icon) => {
          expect(icon).toHaveAttribute('aria-hidden', 'true');
          expect(icon).toHaveAttribute('focusable', 'false');
        });
      });

      describe('Keyboard navigation', () => {
        const customTabsData = [...Array(3)].map((_, index) => ({
          label: `Tab ${index + 1}`,
          selected: index === 0,
        }));
        const lastIndex = customTabsData.length - 1;

        it('should move tab focus via ArrowLeft & ArrowRight keys', () => {
          render(<Tabs data={customTabsData} />);

          const tablist = screen.getByRole('tablist');
          fireEvent.focus(within(tablist).getAllByRole('tab')[0]);

          fireEvent.keyDown(tablist, { key: 'ArrowRight' });
          expect(within(tablist).getAllByRole('tab')[1]).toHaveFocus();

          fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
          expect(within(tablist).getAllByRole('tab')[0]).toHaveFocus();
        });

        it('should move focus to first & last tabs via Home & End keys, and not exceed data.length via ArrowLeft & ArrowRight keys', () => {
          render(<Tabs data={customTabsData} />);

          const tablist = screen.getByRole('tablist');
          fireEvent.focus(within(tablist).getAllByRole('tab')[0]);

          fireEvent.keyDown(tablist, { key: 'End' });
          expect(within(tablist).getAllByRole('tab')[lastIndex]).toHaveFocus();

          fireEvent.keyDown(tablist, { key: 'ArrowRight' });
          expect(within(tablist).getAllByRole('tab')[lastIndex]).toHaveFocus();

          fireEvent.keyDown(tablist, { key: 'Home' });
          expect(within(tablist).getAllByRole('tab')[0]).toHaveFocus();

          fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
          expect(within(tablist).getAllByRole('tab')[0]).toHaveFocus();
        });

        it('should not move tab focus via other keys', () => {
          const { baseElement } = render(<Tabs data={customTabsData} />);

          const tablist = screen.getByRole('tablist');

          fireEvent.keyDown(tablist, { key: 'ArrowUp' });
          expect(baseElement).toHaveFocus();

          fireEvent.keyDown(tablist, { key: 'ArrowDown' });
          expect(baseElement).toHaveFocus();
        });
      });
    });
  });
});
