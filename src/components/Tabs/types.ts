export type TabProps = {
  /** (Not a public prop) */
  index: number;
  /** (Not a public prop) */
  id: string;
  /** (Not a public prop) */
  focusDirty: boolean;
  /** (Not a public prop) */
  focusIndex: number;
  /** (Not a public prop) */
  selectedTab?: string;
  /** (Not a public prop) */
  setSelectedTab(id: string): void;
  /** The tab's text */
  label: string;
  /** The tab's SVG icon */
  icon?: React.SVGProps<SVGElement>;
  /** Whether or not the tab is selected */
  selected?: boolean;
  /** Whether or not the tab is disabled */
  disabled?: boolean;
  /** The `id` of the tabpanel controlled by this tab */
  ariaControls?: string;
  /** Callback function on tab click */
  onClick?(event?: React.MouseEvent<HTMLButtonElement>): void;
  /** (Not a public prop) */
  onFocus?(event?: React.FocusEvent<HTMLButtonElement>): void;
};

export interface TabsProps {
  /** Data for Tab component */
  data: Pick<
    TabProps,
    'ariaControls' | 'icon' | 'label' | 'selected' | 'disabled' | 'onClick'
  >[];
  /** Custom `id` to pass to the component */
  id?: string;
  /** Custom className */
  className?: string;
  /** Aria label for Next arrow button */
  nextButtonLabel?: string;
  /** Aria label for Previous arrow button */
  prevButtonLabel?: string;
  /** Whether or not to add a bottom border */
  hasBottomBorder?: boolean;
  /** Whether or not to center the tabs when no arrow buttons are shown */
  isCentered?: boolean;
  /** Whether or not it is full-width with fixed `label-md` Typography, no column-gap and no arrow buttons */
  isFullWidth?: boolean;
  /** Whether or not to enable horizontal auto-scroll of tabs */
  enableAutoScroll?: boolean;
  /** Callback function on Next arrow button click */
  onNextClick?(event?: React.MouseEvent<HTMLButtonElement>): void;
  /** Callback function on Previous arrow button click */
  onPrevClick?(event?: React.MouseEvent<HTMLButtonElement>): void;
  /** Callback function on tab click */
  onTabClick?(tabIndex: number): void;
}

export interface TabCoordinates {
  id: TabProps['id'];
  left: number;
  right: number;
}
