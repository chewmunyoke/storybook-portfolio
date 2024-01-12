import cssVariables from '../../styles/variables.module.scss';
import Carousel from './index';

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

export const DefaultTemplate = (args: any) => (
  <div style={{ margin: '0 24px' }}>
    <Carousel
      {...args}
      nextButtonLabel="Next"
      prevButtonLabel="Previous"
      pauseButtonLabel="Pause autoplay"
      resumeButtonLabel="Resume autoplay"
      paginationLabel={`Pagination for ${args.title} carousel`}
      paginationIndicatorLabel={`Page %s of %s in ${args.title} carousel`}
    >
      {[...Array(10)].map((_, index) => (
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
      ))}
    </Carousel>
  </div>
);
