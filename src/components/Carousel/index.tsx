import cx from 'classnames';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent, ReactNode, TouchEvent } from 'react';
import { useTimer } from '../../hooks/use-timer';
import { CarouselContext } from './CarouselContext';
import { CarouselHeader } from './CarouselHeader';
import { CarouselBody } from './CarouselBody';
import { CarouselFooter } from './CarouselFooter';
import {
  CAROUSEL_CLASS_NAMES,
  DEFAULT_ITEM_HEIGHT,
  DEFAULT_ITEM_WIDTH,
  GAP_WIDTH,
  DEFAULT_AUTOPLAY_INTERVAL,
  MAIN_INTERSECT_THRESHOLD,
  ITEM_INTERSECT_THRESHOLD,
} from './constants';
import { getStyleTranslateX, setStyleTranslateX } from './utils';

export interface CarouselProps {
  id: string;
  /** Carousel items in an array */
  children: ReactNode[];
  /** Custom className */
  className?: string;
  /** Custom height for the carousel items */
  itemHeight?: number;
  /** Custom width for the carousel items (will be ignored when `isFullWidth` is true) */
  itemWidth?: number;
  /** Whether or not carousel items are full width */
  isFullWidth?: boolean;
  /** Variant of carousel snapping */
  snapType?: 'item' | 'page';
  /** Variant of pagination */
  paginationType?: 'indicator' | 'scrollbar' | 'none';
  /** Placement of the arrow buttons */
  navButtonPlacement?: 'header' | 'body' | 'body-primary' | 'footer' | 'none';
  /** Whether or not the carousel is on autoplay (will be ignored when `paginationType` is not 'indicator') */
  autoplay?: boolean;
  /** Duration of each carousel item in milliseconds */
  autoplayInterval?: number;
  /** Carousel's title */
  title?: string;
  /** Carousel's subtitle */
  subtitle?: string;
  /** Label for the button in the header */
  headerButtonLabel?: string;
  /**
   * Aria label for Next arrow button
   * (Example: `Next`)
   * */
  nextButtonLabel: string;
  /**
   * Aria label for Previous arrow button
   * (Example: `Previous`)
   */
  prevButtonLabel: string;
  /**
   * Aria label for autoplay Pause button
   * (Example: `Pause autoplay`)
   */
  pauseButtonLabel: string;
  /**
   * Aria label for autoplay Play/Resume button
   * (Example: `Resume autoplay`)
   */
  resumeButtonLabel: string;
  /**
   * Aria label for pagination
   * (Example: `Pagination for ${title} carousel`)
   */
  paginationLabel: string;
  /**
   * Aria label for pagination indicator
   * (Example: `Page %s of %s in ${title} carousel`)
   */
  paginationIndicatorLabel: string;
  /** Callback function on header button click */
  onHeaderButtonClick?(event?: MouseEvent<HTMLButtonElement>): void;
  /** Callback function on Next arrow button click */
  onNextClick?(event?: MouseEvent<HTMLButtonElement>): void;
  /** Callback function on Previous arrow button click */
  onPrevClick?(event?: MouseEvent<HTMLButtonElement>): void;
  /** Callback function on autoplay Play/Pause button click */
  onAutoplayButtonClick?(event?: MouseEvent<HTMLButtonElement>): void;
}

export interface CarouselItemCoordinates {
  id: string;
  left: number;
  right: number;
}

export const Carousel = ({
  className,
  id,
  children,
  itemHeight = DEFAULT_ITEM_HEIGHT,
  itemWidth = DEFAULT_ITEM_WIDTH,
  isFullWidth = false,
  snapType = 'page',
  paginationType = 'indicator',
  navButtonPlacement = 'body',
  autoplay = false,
  autoplayInterval = DEFAULT_AUTOPLAY_INTERVAL,
  title,
  subtitle,
  headerButtonLabel,
  nextButtonLabel,
  prevButtonLabel,
  pauseButtonLabel,
  resumeButtonLabel,
  paginationLabel,
  paginationIndicatorLabel,
  onHeaderButtonClick,
  onNextClick,
  onPrevClick,
  onAutoplayButtonClick,
  ...restProps
}: CarouselProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listItemsRef = useRef<HTMLLIElement[]>([]);
  const carouselItemCoordinates = useRef<CarouselItemCoordinates[]>([]);

  const [containerClientWidth, setContainerClientWidth] = useState(0);
  const [finalItemWidth, setFinalItemWidth] = useState(itemWidth);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showPrevButton, setShowPrevButton] = useState(false);
  const [isAutoplaying, setIsAutoplaying] = useState(false);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [maxTranslateX, setMaxTranslateX] = useState(0);
  const [initialPosition, setInitialPosition] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragged, setIsDragged] = useState(false);

  const totalItems = children.length;

  const carouselClassNames = cx(CAROUSEL_CLASS_NAMES.CAROUSEL, className, {
    [`${CAROUSEL_CLASS_NAMES.CAROUSEL}--is-full-width`]: isFullWidth,
    [`${CAROUSEL_CLASS_NAMES.CAROUSEL}--has-autoplay`]: autoplay,
    [`${CAROUSEL_CLASS_NAMES.CAROUSEL}--is-dragging`]: isDragging,
  });

  const autoplayIntervalFn = () => {
    if (currentPage === totalPages - 1) {
      // Return to first page
      navigateByPage(0);
    } else {
      // Navigate to next page
      navigateByDirection(1);
    }
  };

  const { startTimer, pauseTimer, resumeTimer, clearTimer } = useTimer(
    autoplayIntervalFn,
    autoplayInterval
  );

  const navigateByPage = (page: number) => {
    const index = snapType === 'page' ? itemsPerPage * page : page;
    setTargetIndex(index);
    setCurrentPage(page);
  };

  const navigateByIndex = (index: number) => {
    const newCurrentPage =
      snapType === 'page'
        ? Math.floor(index / itemsPerPage)
        : Math.min(index, totalPages - 1);
    navigateByPage(newCurrentPage);
  };

  const navigateByDirection = (direction: -1 | 1) => {
    const list = listRef.current as HTMLUListElement;
    const translateX = getStyleTranslateX(list) * -1;
    const leftPosition = translateX;

    if (paginationType === 'scrollbar') {
      // Get the first fully visible item
      // then add/subtract `itemsPerPage` to/from its index
      let targetIndex = 0;
      for (let i = 0; i < totalItems; i++) {
        const item = carouselItemCoordinates.current[i];
        if (leftPosition <= item.left) {
          targetIndex =
            direction === 1
              ? Math.min(i + itemsPerPage, totalItems - 1)
              : Math.max(i - itemsPerPage, 0);
          break;
        }
      }
      navigateByIndex(targetIndex);
    } else {
      let newPage = 0;
      if (direction === 1) {
        if (autoplay && currentPage + 1 > totalPages - 1) {
          newPage = 0;
        } else {
          newPage = Math.min(currentPage + 1, totalPages - 1);
        }
      } else {
        if (autoplay && currentPage - 1 < 0) {
          newPage = totalPages - 1;
        } else {
          newPage = Math.max(currentPage - 1, 0);
        }
      }
      navigateByPage(newPage);
    }
  };

  const handlePrevButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    navigateByDirection(-1);
    onPrevClick?.(event);
  };

  const handleNextButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    navigateByDirection(1);
    onNextClick?.(event);
  };

  const handleAutoplayButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    setIsAutoplaying((isAutoplaying) => !isAutoplaying);
    onAutoplayButtonClick?.(event);
  };

  const handleMouseEnter = () => {
    if (isAutoplaying) {
      setIsAutoplayPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (isAutoplaying) {
      setIsAutoplayPaused(false);
    }
  };

  const handleMouseDown = (event: MouseEvent) => {
    // Handle only left mouse button click
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();

    const list = listRef.current as HTMLUListElement;
    setInitialPosition(Math.abs(getStyleTranslateX(list)));
    setDragStartPosition(event.clientX);
    setIsDragging(true);
    setIsDragged(false);
  };

  const handleTouchStart = (event: TouchEvent) => {
    const list = listRef.current as HTMLUListElement;
    setInitialPosition(Math.abs(getStyleTranslateX(list)));
    const touch = event.changedTouches[0];
    setDragStartPosition(touch.pageX);
    setIsDragging(true);
    setIsDragged(false);
  };

  const handleMouseMove: any = useCallback(
    (event: MouseEvent) => {
      if (!isDragging) return;

      event.preventDefault();
      event.stopPropagation();

      const list = listRef.current as HTMLUListElement;
      const item = carouselItemCoordinates.current[0];
      const itemWidth = item.right - item.left;
      const deltaX = dragStartPosition - event.clientX;
      const translateX = Math.min(
        Math.max(initialPosition + deltaX, 0),
        list.clientWidth - itemWidth
      );

      setStyleTranslateX(list, translateX * -1);
      setIsDragged(true);
    },
    [isDragging, dragStartPosition]
  );

  const handleTouchMove: any = useCallback(
    (event: TouchEvent) => {
      if (!isDragging) return;

      const list = listRef.current as HTMLUListElement;
      const item = carouselItemCoordinates.current[0];
      const itemWidth = item.right - item.left;
      const touch = event.changedTouches[0];
      const deltaX = dragStartPosition - touch.pageX;
      const translateX = Math.min(
        Math.max(initialPosition + deltaX, 0),
        list.clientWidth - itemWidth
      );

      setStyleTranslateX(list, translateX * -1);
      setIsDragged(true);
    },
    [isDragging, dragStartPosition]
  );

  const handleMouseUpTouchEnd: any = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!isDragging) return;

      if (event.type === 'mouseup') {
        event.preventDefault();
        event.stopPropagation();
      }

      const container = containerRef.current as HTMLDivElement;
      const list = listRef.current as HTMLUListElement;
      const translateX = getStyleTranslateX(list) * -1;
      const leftPosition = translateX;
      const rightPosition = leftPosition + container.clientWidth;
      const direction =
        leftPosition === initialPosition
          ? 0
          : leftPosition > initialPosition
          ? 1
          : -1;

      if (direction === 1) {
        // Get the item after the last fully visible item
        // then check its visibility
        let targetIndex = 0;
        for (let i = totalItems - 1; i > -1; i--) {
          const item = carouselItemCoordinates.current[i];
          const itemWidth = item.right - item.left;
          if (rightPosition > item.left && rightPosition >= item.right) {
            const nextIndex = Math.min(i + 1, totalItems - 1);
            const nextItem = carouselItemCoordinates.current[nextIndex];
            if (
              rightPosition <
              nextItem.left + itemWidth * ITEM_INTERSECT_THRESHOLD
            ) {
              targetIndex = i;
            } else {
              targetIndex = nextIndex;
            }
            break;
          }
        }
        navigateByIndex(targetIndex);
      } else if (direction === -1) {
        // Get the item before the first fully visible item
        // then check its visibility
        let targetIndex = 0;
        for (let i = 0; i < totalItems; i++) {
          const item = carouselItemCoordinates.current[i];
          const itemWidth = item.right - item.left;
          if (leftPosition <= item.left) {
            const prevIndex = Math.max(i - 1, 0);
            const prevItem = carouselItemCoordinates.current[prevIndex];
            if (
              leftPosition >
              prevItem.left + itemWidth * ITEM_INTERSECT_THRESHOLD
            ) {
              targetIndex = i;
            } else {
              targetIndex = prevIndex;
            }
            break;
          }
        }
        navigateByIndex(targetIndex);
      }

      setIsDragging(false);
    },
    [isDragging, initialPosition]
  );

  const updateArrows = useCallback(() => {
    const list = listRef.current as HTMLUListElement;
    const translateX = Math.abs(getStyleTranslateX(list));
    setShowNextButton(autoplay || translateX < maxTranslateX);
    setShowPrevButton(autoplay || translateX > 0);
  }, [maxTranslateX]);

  const handleResize = useCallback(() => {
    const container = containerRef.current as HTMLDivElement;
    if (!container) return;

    const newContainerClientWidth = container.clientWidth - 8; // right padding
    setContainerClientWidth(newContainerClientWidth);

    const newFinalItemWidth = isFullWidth
      ? newContainerClientWidth
      : Math.min(itemWidth, newContainerClientWidth);
    setFinalItemWidth(
      isFullWidth
        ? newContainerClientWidth
        : Math.min(itemWidth, newContainerClientWidth)
    );

    const coordinates: CarouselItemCoordinates[] = [];
    let itemsPerPage = 1;
    let totalPages = 1;
    listItemsRef.current.forEach((item: HTMLLIElement, index) => {
      // Pre-defined values are more accurate than clientWidth & offsetLeft
      // due to ongoing transition animation
      const left = index > 0 ? (newFinalItemWidth + GAP_WIDTH) * index : 0;
      const right = left + newFinalItemWidth;
      if (right < newContainerClientWidth) {
        itemsPerPage = index + 1;
      }
      coordinates.push({
        id: item.id,
        left,
        right,
      });
    });
    if (snapType === 'page') {
      totalPages = Math.ceil(totalItems / itemsPerPage);
    } else {
      totalPages = totalItems - (itemsPerPage - 1);
      itemsPerPage = 1;
    }
    carouselItemCoordinates.current = coordinates;
    setItemsPerPage(itemsPerPage);
    setTotalPages(totalPages);

    const lastTargetIndex = itemsPerPage * (totalPages - 1);
    const lastTargetItem =
      carouselItemCoordinates.current[
        Math.min(lastTargetIndex, totalItems - 1)
      ];
    if (lastTargetItem) {
      setMaxTranslateX(lastTargetItem.left);
    }

    updateArrows();
  }, [isFullWidth, updateArrows]);

  useEffect(() => {
    if (totalItems === 0 || isDragging) return;

    const list = listRef.current as HTMLUListElement;
    const item = carouselItemCoordinates.current[targetIndex];
    if (item) {
      setStyleTranslateX(list, item.left * -1);
    }
  }, [isDragging, currentPage, targetIndex]);

  useEffect(() => {
    handleResize();
  }, [itemHeight, itemWidth, isFullWidth, snapType]);

  useEffect(() => {
    navigateByIndex(targetIndex);
  }, [itemsPerPage]);

  useEffect(() => {
    // When `totalPages` changes during resize
    if (currentPage > totalPages - 1) {
      setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    setIsAutoplaying(autoplay);
  }, [autoplay]);

  useEffect(() => {
    if (isAutoplaying) {
      startTimer();
    }

    return () => {
      clearTimer();
    };
  }, [isAutoplaying, itemsPerPage, totalPages, currentPage]);

  useEffect(() => {
    if (isAutoplayPaused) {
      pauseTimer();
    } else if (isAutoplaying) {
      resumeTimer();
    }
  }, [isAutoplayPaused]);

  useEffect(() => {
    const root = rootRef.current as HTMLDivElement;
    root.style.setProperty('--carousel-gap', `${GAP_WIDTH}px`);
    root.style.setProperty(
      '--carousel-autoplay-interval',
      `${autoplayInterval}ms`
    );
  }, [autoplayInterval]);

  useEffect(() => {
    // Add to document instead of container
    // because cursor can always leave the container
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseup', handleMouseUpTouchEnd);
    document.addEventListener('touchend', handleMouseUpTouchEnd);
    document.addEventListener('mouseleave', handleMouseUpTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUpTouchEnd);
      document.removeEventListener('touchend', handleMouseUpTouchEnd);
      document.removeEventListener('mouseleave', handleMouseUpTouchEnd);
    };
  }, [handleMouseMove, handleTouchMove, handleMouseUpTouchEnd]);

  useEffect(() => {
    const container = containerRef.current as HTMLDivElement;
    const resizeObserver = new ResizeObserver(
      debounce(() => handleResize(), 100)
    );
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  useEffect(() => {
    const list = listRef.current as HTMLUListElement;
    list.addEventListener('transitionend', updateArrows);

    return () => {
      list.removeEventListener('transitionend', updateArrows);
    };
  }, [updateArrows]);

  useEffect(() => {
    const container = containerRef.current as HTMLDivElement;
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (autoplay) {
          setIsAutoplaying(entries[0].isIntersecting);
        }
      },
      {
        threshold: MAIN_INTERSECT_THRESHOLD,
      }
    );
    intersectionObserver.observe(container);

    return () => {
      intersectionObserver.disconnect();
    };
  }, []);

  return totalItems === 0 ? null : (
    <CarouselContext.Provider
      value={{
        className,
        id,
        children,
        itemHeight,
        itemWidth: finalItemWidth,
        isFullWidth,
        snapType,
        paginationType,
        navButtonPlacement,
        autoplay,
        autoplayInterval,
        title,
        subtitle,
        headerButtonLabel,
        nextButtonLabel,
        prevButtonLabel,
        pauseButtonLabel,
        resumeButtonLabel,
        paginationLabel,
        paginationIndicatorLabel,
        onHeaderButtonClick,
        onNextClick: handleNextButtonClick,
        onPrevClick: handlePrevButtonClick,
        onAutoplayButtonClick: handleAutoplayButtonClick,
        containerRef,
        containerClientWidth,
        listRef,
        listItemsRef,
        carouselItemCoordinates: carouselItemCoordinates.current,
        totalItems,
        itemsPerPage,
        totalPages,
        currentPage,
        targetIndex,
        navigateByPage,
        navigateByIndex,
        showPrevButton,
        showNextButton,
        maxTranslateX,
        isAutoplaying,
        isAutoplayPaused,
        isDragged,
        handleMouseEnter,
        handleMouseLeave,
        handleMouseDown,
        handleTouchStart,
        ...restProps,
      }}
    >
      <div className={carouselClassNames} id={id} ref={rootRef} {...restProps}>
        <CarouselHeader />
        <CarouselBody />
        <CarouselFooter />
      </div>
    </CarouselContext.Provider>
  );
};

export default Carousel;
