import cx from 'classnames';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { useCarouselContext } from './CarouselContext';
import {
  CAROUSEL_CLASS_NAMES,
  MIN_THUMB_WIDTH,
  SCROLL_DISTANCE,
} from './constants';
import { getStyleTranslateX, setStyleTranslateX } from './utils';

// Reference: https://www.thisdot.co/blog/creating-custom-scrollbars-with-react/

export const CarouselScrollbar = () => {
  const { id, containerClientWidth, listRef, maxTranslateX } =
    useCarouselContext();

  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef = useRef<HTMLDivElement>(null);
  const [thumbWidth, setThumbWidth] = useState(0);
  const [initialPosition, setInitialPosition] = useState(0);
  const [scrollStartPosition, setScrollStartPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  let currentScrollPercentage = 0;
  if (scrollThumbRef.current) {
    const thumbRight =
      Number(scrollThumbRef.current.style.left.replace('px', '')) + thumbWidth;
    currentScrollPercentage = Math.round(
      (thumbRight / containerClientWidth) * 100
    );
  }

  const handleTrackKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
        return;

      event.preventDefault();
      const list = listRef.current as HTMLUListElement;
      const translateX = getStyleTranslateX(list) * -1;
      let newTranslateX = 0;

      switch (event.key) {
        case 'ArrowLeft':
          newTranslateX = Math.max(translateX - SCROLL_DISTANCE, 0);
          break;
        case 'ArrowRight':
          newTranslateX = Math.min(translateX + SCROLL_DISTANCE, maxTranslateX);
          break;
        case 'Home':
          newTranslateX = 0;
          break;
        case 'End':
          newTranslateX = maxTranslateX;
          break;
      }
      setStyleTranslateX(list, newTranslateX * -1);
    },
    [maxTranslateX]
  );

  const handleTrackClick = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const target = event.target as HTMLDivElement;
      const list = listRef.current as HTMLUListElement;
      const scrollTrack = scrollTrackRef.current as HTMLDivElement;

      const { left: trackLeft } = target.getBoundingClientRect();
      const thumbOffset = thumbWidth / 2;
      const clickRatio =
        (event.clientX - trackLeft - thumbOffset) / scrollTrack.clientWidth;
      const translateX = Math.min(
        Math.max(
          Math.floor((maxTranslateX + containerClientWidth) * clickRatio),
          0
        ),
        maxTranslateX
      );

      setStyleTranslateX(list, translateX * -1);
    },
    [containerClientWidth, maxTranslateX, thumbWidth]
  );

  const handleThumbMouseDown: any = (event: MouseEvent) => {
    // Handle only left mouse button click
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();

    const list = listRef.current as HTMLUListElement;
    setInitialPosition(Math.abs(getStyleTranslateX(list)));
    setScrollStartPosition(event.clientX);
    setIsDragging(true);
  };

  const handleThumbTouchStart: any = (event: TouchEvent) => {
    const list = listRef.current as HTMLUListElement;
    setInitialPosition(Math.abs(getStyleTranslateX(list)));
    const touch = event.changedTouches[0];
    setScrollStartPosition(touch.pageX);
    setIsDragging(true);
  };

  const handleThumbMouseMove: any = useCallback(
    (event: MouseEvent) => {
      if (!isDragging) return;

      event.preventDefault();
      event.stopPropagation();

      const list = listRef.current as HTMLUListElement;
      const deltaX =
        (event.clientX - scrollStartPosition) *
        (containerClientWidth / thumbWidth);
      const translateX = Math.min(
        Math.max(initialPosition + deltaX, 0),
        maxTranslateX
      );

      setStyleTranslateX(list, translateX * -1);
    },
    [
      containerClientWidth,
      maxTranslateX,
      isDragging,
      scrollStartPosition,
      thumbWidth,
    ]
  );

  const handleThumbTouchMove: any = useCallback(
    (event: TouchEvent) => {
      if (!isDragging) return;

      const list = listRef.current as HTMLUListElement;
      const touch = event.changedTouches[0];
      const deltaX =
        (touch.pageX - scrollStartPosition) *
        (containerClientWidth / thumbWidth);
      const translateX = Math.min(
        Math.max(initialPosition + deltaX, 0),
        maxTranslateX
      );

      setStyleTranslateX(list, translateX * -1);
    },
    [
      containerClientWidth,
      maxTranslateX,
      isDragging,
      scrollStartPosition,
      thumbWidth,
    ]
  );

  const handleThumbMouseUpTouchEnd: any = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!isDragging) return;

      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
    },
    [isDragging]
  );

  const handleThumbPosition = useCallback(() => {
    const list = listRef.current as HTMLUListElement;
    const scrollTrack = scrollTrackRef.current as HTMLDivElement;
    const scrollThumb = scrollThumbRef.current as HTMLDivElement;
    if (!list || !scrollTrack || !scrollThumb) return;

    const translateX = getStyleTranslateX(list) * -1;
    const newLeft = Math.min(
      Math.max(
        scrollTrack.clientWidth *
          (translateX / (maxTranslateX + containerClientWidth)),
        0
      ),
      scrollTrack.clientWidth - thumbWidth
    );
    scrollThumb.style.left = `${newLeft}px`;
  }, [containerClientWidth, maxTranslateX, thumbWidth]);

  useEffect(() => {
    handleThumbPosition();
  }, [thumbWidth]);

  useEffect(() => {
    const scrollTrack = scrollTrackRef.current as HTMLDivElement;

    setThumbWidth(
      Math.max(
        scrollTrack.clientWidth *
          (containerClientWidth / (maxTranslateX + containerClientWidth)),
        MIN_THUMB_WIDTH
      )
    );
  }, [containerClientWidth, maxTranslateX]);

  useEffect(() => {
    document.addEventListener('mousemove', handleThumbMouseMove);
    document.addEventListener('touchmove', handleThumbTouchMove);
    document.addEventListener('mouseup', handleThumbMouseUpTouchEnd);
    document.addEventListener('touchend', handleThumbMouseUpTouchEnd);
    document.addEventListener('mouseleave', handleThumbMouseUpTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleThumbMouseMove);
      document.removeEventListener('touchmove', handleThumbTouchMove);
      document.removeEventListener('mouseup', handleThumbMouseUpTouchEnd);
      document.removeEventListener('touchend', handleThumbMouseUpTouchEnd);
      document.removeEventListener('mouseleave', handleThumbMouseUpTouchEnd);
    };
  }, [handleThumbMouseMove, handleThumbTouchMove, handleThumbMouseUpTouchEnd]);

  useEffect(() => {
    const list = listRef.current as HTMLUListElement;
    const scrollTrack = scrollTrackRef.current as HTMLDivElement;
    const resizeObserver = new ResizeObserver(
      debounce(() => handleThumbPosition(), 100)
    );
    resizeObserver.observe(scrollTrack);
    list.addEventListener('transitionstart', handleThumbPosition);

    return () => {
      resizeObserver.disconnect();
      list.removeEventListener('transitionstart', handleThumbPosition);
    };
  }, [handleThumbPosition]);

  return (
    <div
      className={cx(CAROUSEL_CLASS_NAMES.SCROLLBAR, {
        [`${CAROUSEL_CLASS_NAMES.SCROLLBAR}--is-dragging`]: isDragging,
      })}
      role="scrollbar"
      aria-controls={`${id}__list`}
      aria-orientation="horizontal"
      aria-valuenow={currentScrollPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={handleTrackKeyDown}
    >
      <div
        className={CAROUSEL_CLASS_NAMES.SCROLLBAR_TRACK}
        role="presentation"
        ref={scrollTrackRef}
        onClick={handleTrackClick}
      />
      <div
        className={CAROUSEL_CLASS_NAMES.SCROLLBAR_THUMB}
        role="presentation"
        ref={scrollThumbRef}
        onMouseDown={handleThumbMouseDown}
        onTouchStart={handleThumbTouchStart}
        style={{
          width: `${thumbWidth}px`,
        }}
      />
    </div>
  );
};
