import cx from 'classnames';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useCarouselContext } from './CarouselContext';
import {
  CAROUSEL_CLASS_NAMES,
  MAX_INDICATORS_LEFT,
  MAX_INDICATORS_RIGHT,
  MAX_INDICATORS_TOTAL,
} from './constants';
import { addItemToArray, removeItemFromArray } from './utils';

export const CarouselPagination = () => {
  const {
    paginationLabel,
    paginationIndicatorLabel,
    totalPages,
    currentPage,
    navigateByPage,
    isAutoplayPaused,
  } = useCarouselContext();

  const indicatorsRef = useRef<HTMLButtonElement[]>([]);
  const [focusDirty, setFocusDirty] = useState(false);
  const [focusIndex, setFocusIndex] = useState(currentPage);
  const [hiddenIndexes, setHiddenIndexes] = useState<number[]>([]);
  const [fadingIndexes, setFadingIndexes] = useState<number[]>([]);

  const handleFocus = (index: number) => {
    setFocusDirty(true);
    setFocusIndex(index);

    if (hiddenIndexes.includes(index)) {
      navigateByPage(index);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    switch (event.key) {
      case 'ArrowLeft':
        setFocusIndex((prevIndex) => {
          const newIndex = prevIndex - 1;
          return Math.max(newIndex, 0);
        });
        break;
      case 'ArrowRight':
        setFocusIndex((prevIndex) => {
          const newIndex = prevIndex + 1;
          return Math.min(newIndex, totalPages - 1);
        });
        break;
      case 'Home':
        setFocusIndex(0);
        break;
      case 'End':
        setFocusIndex(totalPages - 1);
        break;
    }
  };

  useEffect(() => {
    if (!focusDirty) return;

    const indicator = indicatorsRef.current[focusIndex] as HTMLButtonElement;
    indicator.focus();
  }, [focusIndex]);

  useEffect(() => {
    if (totalPages <= MAX_INDICATORS_TOTAL) {
      setHiddenIndexes([]);
      setFadingIndexes([]);
      return;
    }

    const newHiddenIndexes: number[] = [];
    const newFadingIndexes: number[] = [];

    // Hide indicators beyond MAX_INDICATORS_LEFT & MAX_INDICATORS_RIGHT
    for (let i = 0; i < totalPages; i++) {
      if (
        i < currentPage - MAX_INDICATORS_LEFT ||
        i > currentPage + MAX_INDICATORS_RIGHT
      ) {
        addItemToArray(newHiddenIndexes, i);
      } else if (
        i >= currentPage - MAX_INDICATORS_LEFT ||
        i <= currentPage + MAX_INDICATORS_RIGHT
      ) {
        removeItemFromArray(newHiddenIndexes, i);
      }
    }

    // If currentPage is within first / last group of indicators,
    // unhide indicators to match MAX_INDICATORS_TOTAL
    if (currentPage < MAX_INDICATORS_LEFT + 1) {
      const leftIndicators = currentPage;
      const rightIndicators = MAX_INDICATORS_TOTAL - leftIndicators - 1;
      for (let i = 1; i <= rightIndicators; i++) {
        removeItemFromArray(newHiddenIndexes, currentPage + i);
      }
      addItemToArray(newFadingIndexes, MAX_INDICATORS_TOTAL - 1);
    } else if (currentPage > totalPages - MAX_INDICATORS_RIGHT - 1) {
      const rightIndicators = totalPages - 1 - currentPage;
      const leftIndicators = MAX_INDICATORS_TOTAL - rightIndicators - 1;
      for (let i = 1; i <= leftIndicators; i++) {
        removeItemFromArray(newHiddenIndexes, currentPage - i);
      }
      addItemToArray(newFadingIndexes, totalPages - MAX_INDICATORS_TOTAL);
    } else {
      const leftmostIndicator = currentPage - MAX_INDICATORS_LEFT;
      if (leftmostIndicator !== 0) {
        addItemToArray(newFadingIndexes, leftmostIndicator);
      }
      const rightmostIndicator = currentPage + MAX_INDICATORS_RIGHT;
      if (rightmostIndicator !== totalPages - 1) {
        addItemToArray(newFadingIndexes, rightmostIndicator);
      }
    }

    setHiddenIndexes(newHiddenIndexes);
    setFadingIndexes(newFadingIndexes);
  }, [currentPage, totalPages]);

  const indicatorElements = [];
  for (let i = 0; i < totalPages; i++) {
    const isCurrentPage = i === currentPage;
    indicatorElements.push(
      <CSSTransition
        key={`${CAROUSEL_CLASS_NAMES.PAGINATION_INDICATOR}-${i}`}
        classNames={`${CAROUSEL_CLASS_NAMES.PAGINATION_INDICATOR}-`}
        in={!hiddenIndexes.includes(i)}
        timeout={300}
      >
        <li
          className={cx(CAROUSEL_CLASS_NAMES.PAGINATION_INDICATOR, {
            'is-active': isCurrentPage,
            'is-fading': fadingIndexes.includes(i),
            'is-paused': isCurrentPage && isAutoplayPaused,
          })}
        >
          <button
            className={CAROUSEL_CLASS_NAMES.PAGINATION_INDICATOR_BUTTON}
            aria-label={(paginationIndicatorLabel ?? '')
              .replace('%s', String(i + 1))
              .replace('%s', String(totalPages))}
            aria-current={isCurrentPage ? 'page' : undefined}
            tabIndex={isCurrentPage ? undefined : -1}
            ref={(ref) => (indicatorsRef.current[i] = ref as HTMLButtonElement)}
            onClick={() => navigateByPage(i)}
            onFocus={() => handleFocus(i)}
          >
            <div className={CAROUSEL_CLASS_NAMES.PAGINATION_INDICATOR_OUTER}>
              <div
                className={CAROUSEL_CLASS_NAMES.PAGINATION_INDICATOR_INNER}
              />
            </div>
          </button>
        </li>
      </CSSTransition>
    );
  }

  return (
    <nav aria-label={paginationLabel}>
      <ol
        className={CAROUSEL_CLASS_NAMES.PAGINATION}
        role="presentation"
        onKeyDown={handleKeyDown}
      >
        {indicatorElements}
      </ol>
    </nav>
  );
};
