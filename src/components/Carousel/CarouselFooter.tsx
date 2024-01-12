import cx from 'classnames';
import { IcPause, IcPlay } from '../../icons';
import ButtonCircular from '../ButtonCircular';
import { CarouselButton } from './CarouselButton';
import { CarouselPagination } from './CarouselPagination';
import { CarouselScrollbar } from './CarouselScrollbar';
import { useCarouselContext } from './CarouselContext';
import { CAROUSEL_CLASS_NAMES } from './constants';

export const CarouselFooter = () => {
  const {
    paginationType,
    navButtonPlacement,
    autoplay,
    nextButtonLabel,
    prevButtonLabel,
    pauseButtonLabel,
    resumeButtonLabel,
    onNextClick,
    onPrevClick,
    onAutoplayButtonClick,
    showNextButton,
    showPrevButton,
    isAutoplaying,
  } = useCarouselContext();

  const showNavButtons = navButtonPlacement === 'footer';

  const footerClassNames = cx(CAROUSEL_CLASS_NAMES.FOOTER, {
    [`${CAROUSEL_CLASS_NAMES.FOOTER}--has-nav-buttons`]: showNavButtons,
    [`${CAROUSEL_CLASS_NAMES.FOOTER}--is-autoplaying`]: isAutoplaying,
  });

  return (
    <div className={footerClassNames}>
      {showNavButtons ? (
        <CarouselButton
          direction="prev"
          disabled={!showPrevButton}
          label={prevButtonLabel}
          variant="contained"
          onClick={onPrevClick}
        />
      ) : null}
      {paginationType === 'indicator' ? (
        <CarouselPagination />
      ) : paginationType === 'scrollbar' ? (
        <CarouselScrollbar />
      ) : null}
      {showNavButtons ? (
        <CarouselButton
          direction="next"
          disabled={!showNextButton}
          label={nextButtonLabel}
          variant="contained"
          onClick={onNextClick}
        />
      ) : null}
      {paginationType === 'indicator' && autoplay ? (
        <div className={CAROUSEL_CLASS_NAMES.AUTOPLAY_BUTTON}>
          <ButtonCircular
            aria-label={isAutoplaying ? pauseButtonLabel : resumeButtonLabel}
            variant="contained"
            onClick={onAutoplayButtonClick}
          >
            {isAutoplaying ? <IcPause /> : <IcPlay />}
          </ButtonCircular>
        </div>
      ) : null}
    </div>
  );
};
