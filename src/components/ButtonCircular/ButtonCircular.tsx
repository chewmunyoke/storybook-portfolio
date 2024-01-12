import cx from 'classnames';
import { forwardRef } from 'react';
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentPropsWithRef,
  ReactNode,
  Ref,
  MouseEventHandler,
} from 'react';
import type { ButtonElement } from '../Button/types';
import type { ButtonCircularProps } from './types';

const ButtonCircularComponent = <AsAnchor extends boolean>(
  props: ButtonCircularProps<AsAnchor>,
  ref: ComponentPropsWithRef<ButtonElement<AsAnchor>>['ref']
) => {
  const {
    children,
    type,
    variant = 'basic',
    size = 'medium',
    greyIcon,
    withoutShadows = false,
    disabled,
    id,
    className,
    buttonCursorCustomClassName,
    name,
    asAnchor,
    onClick,
    ...restProps
  } = props;

  const buttonCursorBaseClassName = 'bds-c-btn-cursor';
  const buttonCursorDisabledClassName = disabled ? 'bds-is-disabled' : '';
  const buttonCursorClassName = cx(
    buttonCursorBaseClassName,
    buttonCursorDisabledClassName,
    buttonCursorCustomClassName
  );

  const buttonBaseClassName = 'bds-c-btn';
  const buttonCircularBaseClassName = 'bds-c-btn-circular';
  const buttonCircularVariantClassName = variant
    ? `${buttonCircularBaseClassName}-${variant}`
    : '';
  const buttonCircularSizeClassName = size
    ? `${buttonCircularBaseClassName}--size-${size}`
    : '';
  const buttonCircularGreyIconClassName = greyIcon
    ? `${buttonCircularBaseClassName}--grey-icon`
    : '';
  const buttonCircularWithoutShadowsClassName = withoutShadows
    ? `${buttonCircularBaseClassName}--without-shadows`
    : '';
  const buttonCircularDisabledClassName = disabled ? 'bds-is-disabled' : '';
  const buttonCircularClassName = cx(
    buttonBaseClassName,
    buttonCircularBaseClassName,
    buttonCircularVariantClassName,
    buttonCircularSizeClassName,
    buttonCircularGreyIconClassName,
    buttonCircularWithoutShadowsClassName,
    buttonCircularDisabledClassName,
    className
  );

  const commonProps = {
    className: buttonCircularClassName,
    disabled,
    id,
    onClick,
  };

  return (
    <div className={buttonCursorClassName}>
      {asAnchor ? (
        <a
          {...commonProps}
          role="button"
          aria-disabled={commonProps.disabled}
          tabIndex={commonProps.disabled ? -1 : undefined}
          onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
          ref={ref as Ref<HTMLAnchorElement>}
          {...(restProps as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children as ReactNode}
        </a>
      ) : (
        <button
          {...commonProps}
          ref={ref as Ref<HTMLButtonElement>}
          type={type}
          name={name}
          onClick={onClick as MouseEventHandler<HTMLButtonElement>}
          {...(restProps as ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {children as ReactNode}
        </button>
      )}
    </div>
  );
};

export const ButtonCircularRef = forwardRef(ButtonCircularComponent);
ButtonCircularRef.displayName = 'ButtonCircular';

export const ButtonCircular = ButtonCircularRef as <
  AsAnchor extends boolean = false
>(
  props: ButtonCircularProps<AsAnchor> & {
    ref?: ComponentPropsWithRef<ButtonElement<AsAnchor>>['ref'];
  }
) => ReturnType<typeof ButtonCircularComponent>;
