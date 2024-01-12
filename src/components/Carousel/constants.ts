const baseClassName = 'bds-c-carousel';

export const CAROUSEL_CLASS_NAMES = {
  CAROUSEL: baseClassName,
  HEADER: `${baseClassName}__header`,
  HEADER_TITLE: `${baseClassName}__header__title`,
  HEADER_SUBTITLE: `${baseClassName}__header__subtitle`,
  HEADER_NAV_BUTTONS: `${baseClassName}__header__nav-buttons`,
  BODY: `${baseClassName}__body`,
  LIST_CONTAINER: `${baseClassName}__container`,
  LIST: `${baseClassName}__list`,
  LIST_ITEM: `${baseClassName}__list__item`,
  FOOTER: `${baseClassName}__footer`,
  PAGINATION: `${baseClassName}__pagination`,
  PAGINATION_INDICATOR: `${baseClassName}__pagination__indicator`,
  PAGINATION_INDICATOR_BUTTON: `${baseClassName}__pagination__indicator__button`,
  PAGINATION_INDICATOR_OUTER: `${baseClassName}__pagination__indicator__outer`,
  PAGINATION_INDICATOR_INNER: `${baseClassName}__pagination__indicator__inner`,
  NAV_BUTTON: `${baseClassName}__nav-button`,
  AUTOPLAY_BUTTON: `${baseClassName}__autoplay-button`,
  SCROLLBAR: `${baseClassName}__scrollbar`,
  SCROLLBAR_TRACK: `${baseClassName}__scrollbar__track`,
  SCROLLBAR_THUMB: `${baseClassName}__scrollbar__thumb`,
};

// #region Carousel
export const DEFAULT_ITEM_HEIGHT = 200;
export const DEFAULT_ITEM_WIDTH = 300;
export const GAP_WIDTH = 16; // px
export const DEFAULT_AUTOPLAY_INTERVAL = 5000;
// Carousel needs to be at least 50% visible on screen before autoplay should start
export const MAIN_INTERSECT_THRESHOLD = 0.5;
// Carousel item needs to be at least 50% visible on screen before snapping to its page
export const ITEM_INTERSECT_THRESHOLD = 0.5;
// #endregion Carousel

// #region Carousel Pagination
export const MAX_INDICATORS_LEFT = 2;
export const MAX_INDICATORS_RIGHT = 2;
export const MAX_INDICATORS_TOTAL =
  MAX_INDICATORS_LEFT + MAX_INDICATORS_RIGHT + 1;
// #endregion Carousel Pagination

// #region Carousel Scrollbar
export const MIN_THUMB_WIDTH = 34;
export const SCROLL_DISTANCE = 100;
// #endregion Carousel Scrollbar
