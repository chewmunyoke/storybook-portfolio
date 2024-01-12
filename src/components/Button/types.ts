import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonElement<AsAnchor extends boolean> = AsAnchor extends true
  ? 'a'
  : 'button';

export type ButtonOrAnchorProps<AsAnchor extends boolean> =
  AsAnchor extends false
    ? ButtonHTMLAttributes<HTMLButtonElement>
    : AnchorHTMLAttributes<HTMLAnchorElement>;

export type ButtonTypes = 'submit' | 'reset' | 'button';

export type ButtonLayout =
  | 'default'
  | 'full-width-primary'
  | 'full-width-secondary';

export type ButtonVariants =
  | 'primary'
  | 'secondary'
  | 'primary-reversed'
  | 'secondary-reversed'
  | 'text';

export type ButtonSizes = 'small' | 'regular' | 'medium' | 'large';

export type ButtonStatus = 'is-idle' | 'is-loading' | 'is-success';

export interface ButtonBaseProps<AsAnchor extends boolean> {
  children: ReactNode;
  type?: ButtonTypes;
  prefix?: ReactNode;
  truncatePrefix?: boolean;
  suffix?: ReactNode;
  truncateSuffix?: boolean;
  layout?: ButtonLayout;
  variant?: ButtonVariants;
  size?: ButtonSizes;
  status?: ButtonStatus;
  disabled?: boolean;
  removeSideSpacing?: boolean;
  id?: string;
  name?: string;
  className?: string;
  buttonCursorCustomClassName?: string;
  asAnchor?: AsAnchor;
}

export type ButtonProps<AsAnchor extends boolean = false> =
  ButtonBaseProps<AsAnchor> & Omit<ButtonOrAnchorProps<AsAnchor>, 'prefix'>;
