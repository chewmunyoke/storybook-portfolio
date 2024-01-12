import { SVGProps } from 'react';
import type { ButtonOrAnchorProps, ButtonTypes } from '../Button/types';

export type ButtonCircularVariants = 'basic' | 'contained' | 'primary';

export type ButtonCircularSizes = 'small' | 'medium' | 'large';

export interface ButtonCircularBaseProps<AsAnchor extends boolean> {
  children: SVGProps<SVGElement>;
  type?: ButtonTypes;
  variant?: ButtonCircularVariants;
  size?: ButtonCircularSizes;
  greyIcon?: boolean;
  withoutShadows?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  buttonCursorCustomClassName?: string;
  asAnchor?: AsAnchor;
}

export type ButtonCircularProps<AsAnchor extends boolean = false> =
  ButtonCircularBaseProps<AsAnchor> &
    Omit<ButtonOrAnchorProps<AsAnchor>, 'children' | 'disabled'>;
