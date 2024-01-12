import cx from 'classnames';
import { forwardRef, useRef } from 'react';
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentPropsWithRef,
  Ref,
  MouseEventHandler,
} from 'react';
import { CSSTransition } from 'react-transition-group';
import { IcSuccessFilled } from '../../icons';
import type { ButtonElement, ButtonProps } from './types';

const ButtonComponent = <AsAnchor extends boolean>(
  props: ButtonProps<AsAnchor>,
  ref?: ComponentPropsWithRef<ButtonElement<AsAnchor>>['ref']
) => {
  const {
    children,
    type,
    prefix,
    truncatePrefix,
    suffix,
    truncateSuffix,
    layout = 'default',
    variant = 'primary',
    size = 'regular',
    status = 'is-idle',
    disabled,
    removeSideSpacing,
    id,
    name,
    className,
    buttonCursorCustomClassName,
    asAnchor,
    onClick,
    ...restProps
  } = props;

  const isLoadingRef = useRef(null);
  const isSuccessRef = useRef(null);
  const isIdleRef = useRef(null);

  const buttonCursorBaseClassName = 'bds-c-btn-cursor';
  const buttonCursorLayoutClassName = layout
    ? `${buttonCursorBaseClassName}--layout-${layout}`
    : '';
  const buttonCursorDisabledClassName = disabled ? 'bds-is-disabled' : '';
  const buttonCursorClassName = cx(
    buttonCursorBaseClassName,
    buttonCursorLayoutClassName,
    buttonCursorDisabledClassName,
    buttonCursorCustomClassName
  );

  const buttonBaseClassName = 'bds-c-btn';
  const buttonLayoutClassName = layout
    ? `${buttonBaseClassName}--layout-${layout}`
    : '';
  const buttonVariantClassName = variant
    ? `${buttonBaseClassName}-${variant}`
    : '';
  const buttonSizeClassName = size
    ? `${buttonBaseClassName}--size-${size}`
    : '';
  const buttonStatusClassName = status ? `bds-${status}` : '';
  const buttonDisabledClassName = disabled ? `bds-is-disabled` : '';
  const buttonRemoveSideSpacingClassName = removeSideSpacing
    ? `${buttonBaseClassName}--remove-side-spacing`
    : '';
  const buttonClassName = cx(
    buttonBaseClassName,
    buttonLayoutClassName,
    buttonVariantClassName,
    buttonSizeClassName,
    buttonStatusClassName,
    buttonDisabledClassName,
    buttonRemoveSideSpacingClassName,
    className
  );

  const commonProps = {
    className: buttonClassName,
    disabled:
      status === 'is-loading' || status === 'is-success' ? true : disabled,
    id,
  };

  const content = (
    <>
      <CSSTransition
        nodeRef={isIdleRef}
        in={status === 'is-idle'}
        timeout={3000}
      >
        <span
          ref={isIdleRef}
          className={`${buttonBaseClassName}__idle-content`}
          aria-hidden={
            status === 'is-loading' || status === 'is-success'
              ? true
              : undefined
          }
        >
          {prefix ? (
            <span
              className={`${buttonBaseClassName}__idle-content__prefix ${
                truncatePrefix
                  ? `${buttonBaseClassName}__idle-content__prefix--truncate`
                  : ''
              }`}
            >
              <span>{prefix}</span>
            </span>
          ) : null}
          {children ? (
            <span className={`${buttonBaseClassName}__idle-content__label`}>
              <span>{children}</span>
            </span>
          ) : null}
          {suffix ? (
            <span
              className={`${buttonBaseClassName}__idle-content__suffix ${
                truncateSuffix
                  ? `${buttonBaseClassName}__idle-content__suffix--truncate`
                  : ''
              }`}
            >
              <span>{suffix}</span>
            </span>
          ) : null}
        </span>
      </CSSTransition>
      <CSSTransition
        nodeRef={isLoadingRef}
        in={status === 'is-loading'}
        timeout={3000}
        unmountOnExit
      >
        <span
          ref={isLoadingRef}
          className={`${buttonBaseClassName}__loading-content`}
          aria-hidden="true"
        >
          ···
        </span>
      </CSSTransition>
      <CSSTransition
        nodeRef={isSuccessRef}
        in={status === 'is-success'}
        timeout={3000}
        unmountOnExit
      >
        <span
          ref={isSuccessRef}
          className={`${buttonBaseClassName}__success-content`}
          aria-hidden="true"
        >
          <span
            className={`${buttonBaseClassName}__success-content__circle-1`}
          ></span>
          <span
            className={`${buttonBaseClassName}__success-content__circle-2`}
          ></span>
          <IcSuccessFilled />
        </span>
      </CSSTransition>
    </>
  );

  return (
    <div className={buttonCursorClassName}>
      {asAnchor ? (
        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events */
        <a
          {...commonProps}
          role="button"
          aria-disabled={commonProps.disabled}
          tabIndex={commonProps.disabled ? -1 : undefined}
          onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
          ref={ref as Ref<HTMLAnchorElement>}
          {...(restProps as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      ) : (
        <button
          {...commonProps}
          type={type}
          name={name}
          onClick={onClick as MouseEventHandler<HTMLButtonElement>}
          ref={ref as Ref<HTMLButtonElement>}
          {...(restProps as ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {content}
        </button>
      )}
    </div>
  );
};

const ButtonRef = forwardRef(ButtonComponent);
ButtonRef.displayName = 'button';

export const Button = ButtonRef as <AsAnchor extends boolean = false>(
  props: ButtonProps<AsAnchor> & {
    ref?: ComponentPropsWithRef<ButtonElement<AsAnchor>>['ref'];
  }
) => ReturnType<typeof ButtonComponent>;
