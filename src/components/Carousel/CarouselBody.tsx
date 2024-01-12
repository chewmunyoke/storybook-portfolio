import { useCallback, useEffect, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { CSSTransition } from 'react-transition-group';
import { CarouselButton } from './CarouselButton';
import { useCarouselContext } from './CarouselContext';
import { CAROUSEL_CLASS_NAMES } from './constants';
import { getStyleTranslateX, setStyleTranslateX } from './utils';

export const CarouselBody = () => {
  const {
    id,
    children,
    itemHeight,
    itemWidth,
    isFullWidth,
    paginationType,
    navButtonPlacement,
    autoplay,
    nextButtonLabel,
    prevButtonLabel,
    onNextClick,
    onPrevClick,
    containerRef,
    listRef,
    listItemsRef,
    carouselItemCoordinates,
    totalItems,
    targetIndex,
    navigateByIndex,
    showNextButton,
    showPrevButton,
    maxTranslateX,
    isDragged,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseDown,
    handleTouchStart,
  } = useCarouselContext();

  const [focusDirty, setFocusDirty] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);

  const buttonVariant =
    navButtonPlacement === 'body-primary' ? 'primary' : 'contained';
  const shouldUseFadingAnimation = autoplay && isFullWidth;

  const handleItemClick: any = useCallback(
    (event: MouseEvent) => {
      // Prevent carousel item link from triggering after finish dragging
      if (isDragged) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [isDragged]
  );

  const handleFocus = (event: FocusEvent, index: number) => {
    // Prevent scrolling which interferes with translateX
    event.preventDefault();
    const anchor = event.target as HTMLAnchorElement;
    anchor.focus({ preventScroll: true });

    setFocusDirty(true);
    setFocusIndex(index);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    const container = containerRef.current as HTMLDivElement;
    const list = listRef.current as HTMLUListElement;
    const translateX = getStyleTranslateX(list) * -1;
    const leftPosition = translateX;
    const rightPosition = leftPosition + container.clientWidth;

    switch (event.key) {
      case 'ArrowLeft':
        setFocusIndex((prevIndex) => {
          const newIndex = Math.max(prevIndex - 1, 0);
          const item = carouselItemCoordinates[newIndex];
          if (item.left < leftPosition) {
            navigateByIndex(newIndex);
          }
          return newIndex;
        });
        break;
      case 'ArrowRight':
        setFocusIndex((prevIndex) => {
          const newIndex = Math.min(prevIndex + 1, totalItems - 1);
          const item = carouselItemCoordinates[newIndex];
          if (item.right > rightPosition) {
            navigateByIndex(newIndex);
          }
          return newIndex;
        });
        break;
      case 'Home':
        setFocusIndex(0);
        navigateByIndex(0);
        break;
      case 'End':
        setFocusIndex(totalItems - 1);
        navigateByIndex(totalItems - 1);
        break;
    }
  };

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (paginationType !== 'scrollbar') return;

      const list = listRef.current as HTMLUListElement;
      const translateX = getStyleTranslateX(list);
      const newTranslateX = Math.min(
        Math.max(translateX * -1 + event.deltaX, 0),
        maxTranslateX
      );

      setStyleTranslateX(list, newTranslateX * -1);
    },
    [maxTranslateX]
  );

  useEffect(() => {
    if (!focusDirty) return;

    const item = (listItemsRef.current as HTMLLIElement[])[
      focusIndex
    ].querySelector('a') as HTMLAnchorElement;
    item?.focus({ preventScroll: true });
  }, [focusIndex]);

  useEffect(() => {
    (listItemsRef.current as HTMLLIElement[]).forEach(
      (item: HTMLLIElement, index) => {
        const anchor = item.querySelector('a');
        if (anchor) {
          anchor.tabIndex = index === targetIndex ? 0 : -1;
        }
      }
    );
  }, [targetIndex]);

  useEffect(() => {
    const list = listRef.current as HTMLUListElement;
    Array.from(
      list.querySelectorAll(`.${CAROUSEL_CLASS_NAMES.LIST_ITEM} a`)
    ).forEach((value, index) => {
      const item = value as HTMLDivElement;
      item.addEventListener('click', handleItemClick);
      item.addEventListener(
        'focus',
        function focusEventHandler(event: FocusEvent) {
          handleFocus(event, index);
          this.removeEventListener('focus', focusEventHandler);
        }
      );
    });

    return () => {
      Array.from(
        list.querySelectorAll(`.${CAROUSEL_CLASS_NAMES.LIST_ITEM} a`)
      ).forEach((value) => {
        const item = value as HTMLDivElement;
        item.removeEventListener('click', handleItemClick);
      });
    };
  }, [handleItemClick]);

  useEffect(() => {
    const container = containerRef.current as HTMLDivElement;
    container.addEventListener('wheel', handleWheel);

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  const itemElements = children.map((item, index) => (
    <CSSTransition
      key={`${CAROUSEL_CLASS_NAMES.LIST_ITEM}-${index}`}
      classNames={
        shouldUseFadingAnimation ? `${CAROUSEL_CLASS_NAMES.LIST_ITEM}-` : ''
      }
      appear={index === targetIndex}
      in={index === targetIndex}
      timeout={600}
    >
      <li
        className={CAROUSEL_CLASS_NAMES.LIST_ITEM}
        id={`${id}__list-item-${index}`}
        ref={(ref) =>
          ((listItemsRef.current as HTMLLIElement[])[index] =
            ref as HTMLLIElement)
        }
        style={{
          height: itemHeight,
          width: itemWidth,
        }}
      >
        {item}
      </li>
    </CSSTransition>
  ));

  return (
    <>
      <div className={CAROUSEL_CLASS_NAMES.BODY}>
        <div
          className={CAROUSEL_CLASS_NAMES.LIST_CONTAINER}
          role="presentation"
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <ul
            className={CAROUSEL_CLASS_NAMES.LIST}
            id={`${id}__list`}
            role="presentation"
            ref={listRef}
            onKeyDown={handleKeyDown}
          >
            {itemElements}
          </ul>
        </div>
        {navButtonPlacement &&
          ['body', 'body-primary'].includes(navButtonPlacement) && (
            <>
              {showNextButton && (
                <CarouselButton
                  className={`${CAROUSEL_CLASS_NAMES.NAV_BUTTON}--body`}
                  direction="next"
                  label={nextButtonLabel}
                  variant={buttonVariant}
                  onClick={onNextClick}
                />
              )}
              {showPrevButton && (
                <CarouselButton
                  className={`${CAROUSEL_CLASS_NAMES.NAV_BUTTON}--body`}
                  direction="prev"
                  label={prevButtonLabel}
                  variant={buttonVariant}
                  onClick={onPrevClick}
                />
              )}
            </>
          )}
      </div>
    </>
  );
};
