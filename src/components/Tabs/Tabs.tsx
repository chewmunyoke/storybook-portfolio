import cx from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IcArrowBack, IcArrowForward } from '../../icons';
import ButtonCircular from '../ButtonCircular';
import { PREV_BUTTON_WIDTH, TABS_CLASS_NAMES } from './constants';
import Tab from './Tab';
import type { TabProps, TabsProps, TabCoordinates } from './types';

export const Tabs = ({
  className,
  data,
  hasBottomBorder = false,
  id = 'tabs',
  isCentered = false,
  isFullWidth = false,
  onNextClick,
  onPrevClick,
  onTabClick,
  nextButtonLabel = 'Next',
  prevButtonLabel = 'Previous',
  enableAutoScroll,
  ...restProps
}: TabsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabCoordinates = useRef<TabCoordinates[]>([]);

  const [focusDirty, setFocusDirty] = useState(false);
  const [focusIndex, setFocusIndex] = useState(
    data.findIndex((value) => {
      const item = value as TabProps;
      return item.selected;
    })
  );
  const [showNextButton, setShowNextButton] = useState(false);
  const [showPrevButton, setShowPrevButton] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>();

  const disabledIndexes: number[] = [];
  data.forEach((item, index) => {
    if (item.disabled) {
      disabledIndexes.push(index);
    }
  });

  const navigateTabs = (direction: -1 | 1) => {
    const container = containerRef.current as HTMLDivElement;

    if (direction === 1) {
      // Get last fully visible tab and scroll to the one after it
      const targetPosition =
        container.clientWidth + container.scrollLeft - PREV_BUTTON_WIDTH;
      for (let index = tabCoordinates.current.length - 1; index > -1; index--) {
        const element = tabCoordinates.current[index];
        if (targetPosition > element.left && targetPosition >= element.right) {
          const targetIndex = Math.min(
            index + 1,
            tabCoordinates.current.length - 1
          );
          const targetId = tabCoordinates.current[targetIndex].id;
          const tab = container.querySelector(`#${targetId}`) as HTMLDivElement;
          const tabLeftBoundary = tab.offsetLeft;
          container.scrollTo({
            left: tabLeftBoundary - PREV_BUTTON_WIDTH,
            behavior: 'smooth',
          });
          break;
        }
      }
    } else {
      // Get first fully visible tab and scroll to the one before it
      const targetPosition = container.scrollLeft + PREV_BUTTON_WIDTH;
      for (let index = 0; index < tabCoordinates.current.length; index++) {
        const element = tabCoordinates.current[index];
        if (targetPosition <= element.left) {
          const targetIndex = Math.max(index - 1, 0);
          const targetId = tabCoordinates.current[targetIndex].id;
          const tab = container.querySelector(`#${targetId}`) as HTMLDivElement;
          const tabRightBoundary = tab.offsetLeft + tab.clientWidth;
          container.scrollTo({
            left: tabRightBoundary - container.clientWidth + PREV_BUTTON_WIDTH,
            behavior: 'smooth',
          });
          break;
        }
      }
    }
  };

  const handlePrevButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    navigateTabs(-1);
    onPrevClick?.(event);
  };

  const handleNextButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    navigateTabs(1);
    onNextClick?.(event);
  };

  const handleTabFocus = (tabIndex: number) => {
    setFocusDirty(true);
    setFocusIndex(tabIndex);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    switch (event.key) {
      case 'ArrowLeft':
        setFocusIndex((prevIndex) => {
          let newIndex = prevIndex;
          for (let i = prevIndex; i > 0; i--) {
            if (!disabledIndexes.includes(i - 1)) {
              newIndex = i - 1;
              break;
            }
          }
          return Math.max(newIndex, 0);
        });
        break;
      case 'ArrowRight':
        setFocusIndex((prevIndex) => {
          let newIndex = prevIndex;
          for (let i = prevIndex; i < data.length - 1; i++) {
            if (!disabledIndexes.includes(i + 1)) {
              newIndex = i + 1;
              break;
            }
          }
          return Math.min(newIndex, data.length - 1);
        });
        break;
      case 'Home':
        setFocusIndex(0);
        break;
      case 'End':
        setFocusIndex(data.length - 1);
        break;
    }
  };

  const updateArrows = () => {
    const container = containerRef.current as HTMLDivElement;
    const maxContainerScroll = container.scrollWidth - container.clientWidth;
    setShowNextButton(Math.ceil(container.scrollLeft) < maxContainerScroll);
    setShowPrevButton(Math.ceil(container.scrollLeft) > 0);
  };

  const scrollTabIntoView = useCallback((id: string) => {
    const arrowBtnSize = 44;
    const element = globalThis?.document?.getElementById(id);
    const outerWrapper = containerRef.current;
    if (element && outerWrapper) {
      const outerWrapperWidth = outerWrapper.clientWidth;

      if (outerWrapperWidth !== outerWrapper.scrollWidth) {
        const outerWrapperScroll = outerWrapper.scrollLeft;
        const outerWrapperPosition = outerWrapperScroll + outerWrapperWidth;
        const elementLeftBoundary = element.offsetLeft;
        const elementRightBoundary = elementLeftBoundary + element.clientWidth;

        // check element position to parent
        const isElementPartiallyVisibleFromTheRight =
          elementLeftBoundary < outerWrapperPosition &&
          elementRightBoundary + arrowBtnSize > outerWrapperPosition;
        const isElementCompletelyHiddenToTheRight =
          elementLeftBoundary >= outerWrapperPosition &&
          elementRightBoundary > outerWrapperPosition;
        const isElementPartiallyVisibleFromTheLeft =
          elementLeftBoundary - arrowBtnSize < outerWrapperScroll &&
          elementRightBoundary > outerWrapperScroll;
        const isElementCompletelyHiddenToTheLeft =
          elementLeftBoundary < outerWrapperScroll &&
          elementRightBoundary <= outerWrapperScroll;

        if (
          isElementPartiallyVisibleFromTheRight ||
          isElementCompletelyHiddenToTheRight
        ) {
          outerWrapper.scrollTo?.({
            left: elementLeftBoundary - arrowBtnSize, // just keep away from the arrow buttons. Buttons size is 44px
            behavior: 'smooth',
          });
        } else if (
          isElementPartiallyVisibleFromTheLeft ||
          isElementCompletelyHiddenToTheLeft
        ) {
          outerWrapper.scrollTo?.({
            left: elementRightBoundary - outerWrapperWidth + arrowBtnSize,
            behavior: 'smooth',
          });
        }
      }
    }
  }, []);

  // Scroll active tab into view after tab selection
  useEffect(() => {
    if (enableAutoScroll && selectedTab !== undefined) {
      scrollTabIntoView(selectedTab);
    }
  }, [scrollTabIntoView, selectedTab]);

  useEffect(() => {
    const container = containerRef.current as HTMLDivElement;
    if (!isFullWidth) {
      container.addEventListener('scroll', updateArrows);
    }

    const handleResize = () => {
      const container = containerRef.current as HTMLDivElement;
      const coordinates: TabCoordinates[] = [];
      Array.from(
        container.querySelectorAll(`.${TABS_CLASS_NAMES.TAB}`)
      ).forEach((value) => {
        const tab = value as HTMLDivElement;
        const { offsetLeft, clientWidth, id } = tab;
        coordinates.push({
          id,
          left: offsetLeft,
          right: offsetLeft + clientWidth,
        });
      });
      tabCoordinates.current = coordinates;
      updateArrows();
    };
    globalThis.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      container.removeEventListener('scroll', updateArrows);
      globalThis.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className={cx(TABS_CLASS_NAMES.TABS, className, {
        [`${TABS_CLASS_NAMES.TABS}--has-bottom-border`]: hasBottomBorder,
        [`${TABS_CLASS_NAMES.TABS}--is-centered`]:
          isCentered && !showNextButton && !showPrevButton,
        [`${TABS_CLASS_NAMES.TABS}--is-full-width`]: isFullWidth,
      })}
      id={id}
      {...restProps}
    >
      <div
        className={`${TABS_CLASS_NAMES.TABS}__container`}
        data-testid={`${id}__tabs-container`}
        ref={containerRef}
      >
        <ul
          className={`${TABS_CLASS_NAMES.TABS}__list`}
          aria-orientation="horizontal"
          id={`${id}__tablist`}
          role="tablist"
          onKeyDown={handleKeyDown}
        >
          {data.map((item, index) => (
            <Tab
              {...item}
              key={`${id}__tab-${index}`}
              id={`${id}__tab-${index}`}
              index={index}
              focusDirty={focusDirty}
              focusIndex={focusIndex}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                item.onClick?.(event);
                onTabClick?.(index);
              }}
              onFocus={() => {
                handleTabFocus(index);
              }}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
          ))}
        </ul>
      </div>
      {showPrevButton && (
        <div
          className={`${TABS_CLASS_NAMES.TABS}__button-overlay ${TABS_CLASS_NAMES.TABS}__button-overlay--prev`}
        >
          <ButtonCircular
            aria-controls={`${id}__tablist`}
            aria-label={prevButtonLabel}
            size="medium"
            variant="contained"
            onClick={handlePrevButtonClick}
          >
            <IcArrowBack />
          </ButtonCircular>
        </div>
      )}
      {showNextButton && (
        <div
          className={`${TABS_CLASS_NAMES.TABS}__button-overlay ${TABS_CLASS_NAMES.TABS}__button-overlay--next`}
        >
          <ButtonCircular
            aria-controls={`${id}__tablist`}
            aria-label={nextButtonLabel}
            size="medium"
            variant="contained"
            onClick={handleNextButtonClick}
          >
            <IcArrowForward />
          </ButtonCircular>
        </div>
      )}
    </div>
  );
};

export default Tabs;
