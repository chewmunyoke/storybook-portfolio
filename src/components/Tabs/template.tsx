import { useState } from 'react';
import Button from '../Button';
import { TABS_CLASS_NAMES } from './constants';
import Tabs from './Tabs';

export const DefaultTemplate = (args: any) => <Tabs {...args} />;

export const DemoTemplate = () => {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const data = [...Array(30)].map((_, index) => ({
    ariaControls: `tabpanel-${index}`,
    label: `Tab ${index + 1}`,
    selected: selectedIndex === index,
  }));
  const id = 'tabs-demo';

  const handleTabClick = (tabIndex: number) => {
    setSelectedIndex(tabIndex);
  };

  return (
    <section>
      <Tabs data={data} id={id} onTabClick={handleTabClick} />
      <div
        className={`${TABS_CLASS_NAMES.TAB_PANELS}`}
        style={{ padding: '16px 8px' }}
      >
        {data.map((item, index) => (
          <div
            key={`tabpanel-${index}`}
            className={`${TABS_CLASS_NAMES.TAB_PANEL}`}
            aria-labelledby={`${id}__tab-${index}`}
            id={`tabpanel-${index}`}
            role="tabpanel"
            style={{
              display: item.selected ? 'block' : 'none',
            }}
          >
            {`TabPanel ${index + 1}`}
          </div>
        ))}
      </div>
    </section>
  );
};

export const AutoScrollTemplate = () => {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const data = [...Array(30)].map((_, index) => ({
    label: `Tab ${index + 1}`,
    selected: selectedIndex === index,
  }));

  const handleTabClick = (tabIndex: number) => {
    setSelectedIndex(tabIndex);
  };

  return (
    <section>
      <div style={{ marginBottom: '16px' }}>
        <Tabs
          enableAutoScroll
          data={data}
          id="tabs-auto-scroll"
          onTabClick={handleTabClick}
        />
      </div>
      <Button onClick={() => handleTabClick(29)}>Select Tab 30</Button>
    </section>
  );
};
