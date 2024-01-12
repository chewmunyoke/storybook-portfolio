import Button from '../Button';
import { CarouselButton } from './CarouselButton';
import { useCarouselContext } from './CarouselContext';
import { CAROUSEL_CLASS_NAMES } from './constants';

export const CarouselHeader = () => {
  const {
    navButtonPlacement,
    title,
    subtitle,
    headerButtonLabel,
    nextButtonLabel,
    prevButtonLabel,
    onHeaderButtonClick,
    onNextClick,
    onPrevClick,
    showNextButton,
    showPrevButton,
  } = useCarouselContext();

  if (!title && !subtitle && !headerButtonLabel) return null;

  return (
    <div className={CAROUSEL_CLASS_NAMES.HEADER}>
      <div className={`${CAROUSEL_CLASS_NAMES.HEADER}--left`}>
        {Boolean(title) && (
          <div className={CAROUSEL_CLASS_NAMES.HEADER_TITLE}>{title}</div>
        )}
        {Boolean(subtitle) && (
          <div className={CAROUSEL_CLASS_NAMES.HEADER_SUBTITLE}>{subtitle}</div>
        )}
      </div>
      <div className={`${CAROUSEL_CLASS_NAMES.HEADER}--right`}>
        {Boolean(headerButtonLabel) && (
          <Button
            variant="text"
            size="small"
            removeSideSpacing
            onClick={onHeaderButtonClick}
          >
            {headerButtonLabel}
          </Button>
        )}
        {navButtonPlacement === 'header' && (
          <div className={CAROUSEL_CLASS_NAMES.HEADER_NAV_BUTTONS}>
            <CarouselButton
              direction="prev"
              disabled={!showPrevButton}
              label={prevButtonLabel}
              variant="contained"
              onClick={onPrevClick}
            />
            <CarouselButton
              direction="next"
              disabled={!showNextButton}
              label={nextButtonLabel}
              variant="contained"
              onClick={onNextClick}
            />
          </div>
        )}
      </div>
    </div>
  );
};
