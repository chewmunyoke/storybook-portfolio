import cx from 'classnames';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { TABS_CLASS_NAMES } from './constants';
import type { TabProps } from './types';

export const Tab = ({
  ariaControls,
  disabled,
  focusDirty,
  focusIndex,
  icon,
  id,
  index,
  label,
  onClick,
  onFocus,
  selected,
  selectedTab,
  setSelectedTab,
}: TabProps) => {
  const tabRef = useRef<HTMLButtonElement>(null);

  // The selected tab is focusable by default
  // If there is no selected tab, make the first tab focusable
  const hasTabIndex = selected || (selectedTab === undefined && index === 0);

  useEffect(() => {
    const tab = tabRef.current as HTMLButtonElement;

    if (focusDirty && index === focusIndex) {
      tab.focus();
    }
  }, [focusIndex]);

  useEffect(() => {
    if (selected) {
      setSelectedTab(id);
    }
  }, [selected]);

  return (
    <li
      className={cx(TABS_CLASS_NAMES.TAB, {
        'bds-is-disabled': disabled,
        'is-selected': selected,
      })}
      id={id}
      role="presentation"
    >
      <button
        aria-controls={ariaControls}
        aria-labelledby={`${id}-label`}
        aria-selected={Boolean(selected)}
        disabled={disabled}
        onClick={onClick}
        onFocus={onFocus}
        ref={tabRef}
        role="tab"
        tabIndex={hasTabIndex ? undefined : -1}
      >
        {icon ? (
          <div className={`${TABS_CLASS_NAMES.TAB}__icon`}>
            {icon as ReactNode}
          </div>
        ) : null}
        <span className={`${TABS_CLASS_NAMES.TAB}__label`} id={`${id}-label`}>
          {label}
        </span>
      </button>
    </li>
  );
};

export default Tab;
