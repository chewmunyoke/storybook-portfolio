import type { Meta, StoryObj } from '@storybook/react';
import Carousel from './index';
import cssVariables from '../../styles/variables.module.scss';

type Story = StoryObj<typeof Carousel>;

const meta: Meta<typeof Carousel> = {
  title: 'Components/Carousel',
  component: Carousel,
  decorators: [
    (Story) => (
      <div style={{ margin: '0 24px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Default button component',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

const items = [
  {
    color: '#ffb3ba',
  },
  {
    color: '#ffdfba',
  },
  {
    color: '#ffffba',
  },
  {
    color: '#baffc9',
  },
  {
    color: '#bae1ff',
  },
];
const carouselItems = [...Array(10)].map((_, index) => (
  <a
    key={index}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      color: cssVariables.colorNeutralPrimary,
      backgroundColor: items[index % 5].color,
      borderRadius: cssVariables.bdsCornerRadiusContainer,
      textDecoration: 'none',
    }}
    href="#"
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div>{`Item ${index + 1}`}</div>
    </div>
  </a>
));

export const Default: Story = {
  args: {
    id: 'carousel-default',
    title: 'Default',
    children: carouselItems,
  },
};

export const CustomItemWidthAndHeight: Story = {
  args: {
    id: 'carousel-item-width-height',
    title: 'Custom Width & Height',
    itemHeight: 300,
    itemWidth: 200,
    children: carouselItems,
  },
};

export const ItemFullWidth: Story = {
  args: {
    id: 'carousel-isFullWidth',
    title: 'isFullWidth: true',
    isFullWidth: true,
    children: carouselItems,
  },
};

export const NavButtonPlacementHeader: Story = {
  args: {
    id: 'carousel-navButtonPlacement-header',
    title: 'Nav Button Placement: Header',
    navButtonPlacement: 'header',
    children: carouselItems,
  },
};
