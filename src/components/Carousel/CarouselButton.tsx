import type { MouseEvent } from 'react';
import cx from 'classnames';
import { IcArrowTailBack, IcArrowTailForward } from '../../icons';
import ButtonCircular from '../ButtonCircular';
import type { ButtonCircularProps } from '../ButtonCircular';
import { useCarouselContext } from './CarouselContext';
import { CAROUSEL_CLASS_NAMES } from './constants';

interface CarouselButtonProps {
  className?: string;
  direction: 'next' | 'prev';
  disabled?: boolean;
  label: string;
  variant: Exclude<ButtonCircularProps['variant'], 'basic'>;
  onClick?(event?: MouseEvent<HTMLButtonElement>): void;
}

export const CarouselButton = ({
  className,
  direction,
  disabled,
  label,
  onClick,
  variant,
}: CarouselButtonProps) => {
  const { id } = useCarouselContext();

  return (
    <div
      className={cx(
        CAROUSEL_CLASS_NAMES.NAV_BUTTON,
        className,
        `${CAROUSEL_CLASS_NAMES.NAV_BUTTON}--${direction}`,
        {
          [`${CAROUSEL_CLASS_NAMES.NAV_BUTTON}--large`]: variant === 'primary',
        }
      )}
    >
      <ButtonCircular
        aria-controls={`${id}__list`}
        aria-label={label}
        disabled={disabled}
        size={variant === 'contained' ? 'medium' : 'large'}
        variant={variant}
        onClick={onClick}
      >
        {direction === 'next' ? <IcArrowTailForward /> : <IcArrowTailBack />}
      </ButtonCircular>
    </div>
  );
};
