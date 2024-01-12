import { createContext, useContext } from 'react';
import type { MouseEvent, RefObject, TouchEvent } from 'react';
import type { CarouselProps, CarouselItemCoordinates } from './index';

export type CarouselContextProps = CarouselProps & {
  containerRef: RefObject<HTMLDivElement>;
  containerClientWidth: number;
  listRef: RefObject<HTMLUListElement>;
  listItemsRef: RefObject<HTMLLIElement[]>;
  carouselItemCoordinates: CarouselItemCoordinates[];
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
  targetIndex: number;
  navigateByPage(page: number): void;
  navigateByIndex(index: number): void;
  showNextButton: boolean;
  showPrevButton: boolean;
  maxTranslateX: number;
  isAutoplaying: boolean;
  isAutoplayPaused: boolean;
  isDragged: boolean;
  handleMouseEnter(): void;
  handleMouseLeave(): void;
  handleMouseDown(event: MouseEvent): void;
  handleTouchStart(event: TouchEvent): void;
};

export const CarouselContext = createContext<CarouselContextProps | undefined>(
  undefined
);

export const useCarouselContext = () => {
  const context = useContext(CarouselContext);
  if (context === undefined) {
    throw new Error(
      'useCarouselContext must be used within a CarouselProvider'
    );
  }
  return context;
};
