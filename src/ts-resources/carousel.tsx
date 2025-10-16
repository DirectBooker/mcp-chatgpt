import React from 'react';
import { createRoot } from 'react-dom/client';
import useEmblaCarousel from 'embla-carousel-react';
import { useToolOutput } from '../shared/open-ai-globals';
import { Hotel } from '../directbooker/types';

const Carousel = (): React.JSX.Element => {
  return <HotelCarousel />;
};

function HotelCarousel(): React.JSX.Element {
  const [emblaRef] = useEmblaCarousel({ dragFree: true });
  console.error(`The embla ref: ${emblaRef}`);

  const toolOutput = useToolOutput<{ hotels: Array<Hotel> }>();
  console.log('Frobnitz', toolOutput);

  if (toolOutput) {
    const count = (toolOutput.hotels as Array<unknown>).length;
    console.error('the count: ', count);
  }

  const hotels: Array<Hotel> = toolOutput?.hotels || [];

  return (
    <div className="embla" ref={emblaRef} style={{ overflow: 'hidden' }}>
      <div className="embla__container" style={{ display: 'flex' }}>
        {hotels.slice(0, 10).map(hotel => (
          <HotelCard key={hotel.hotel_id} hotel={hotel} />
        ))}
      </div>
    </div>
  );
}

interface HotelCardProps {
  hotel: Hotel;
}

function HotelCard({ hotel }: HotelCardProps): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        flex: '0 0 35vw',
        margin: '0 0.5em',
      }}
    >
      <div style={{ width: '100%' }}>
        <img
          src={hotel.carousel_image}
          alt={hotel.name}
          style={{
            width: '100%',
            maxWidth: '35vw',
            aspectRatio: '1/1',
            borderRadius: '1rem',
            objectFit: 'cover',
            boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.05)',
          }}
        />
      </div>
      <div
        style={{
          marginTop: '0.75rem' /* mt-3 */,
          display: 'flex' /* flex */,
          flexDirection: 'column' /* flex-col */,
          flex: '1 1 auto' /* flex-1 flex-auto combined */,
        }}
      >
        <div
          style={{
            fontSize: '1rem' /* text-base */,
            lineHeight: '1.5rem' /* text-base (includes line-height) */,
            fontWeight: '500' /* font-medium */,
            overflow: 'hidden' /* truncate */,
            textOverflow: 'ellipsis' /* truncate */,
            whiteSpace: 'nowrap' /* truncate */,
            display: '-webkit-box' /* line-clamp-1 */,
            WebkitLineClamp: 1 /* line-clamp-1 */,
            WebkitBoxOrient: 'vertical' /* line-clamp-1 */,
          }}
        >
          {hotel.name}
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            lineHeight: '1rem',
            marginTop: '0.25rem',
            color: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          {`Rating: ${hotel.rating}`}
        </div>
        {hotel.description ? (
          <div
            style={{
              fontSize: '0.875rem' /* text-sm */,
              lineHeight: '1.25rem' /* text-sm (includes line-height) */,
              marginTop: '0.5rem' /* mt-2 */,
              color: 'rgba(0, 0, 0, 0.8)' /* text-black/80 */,
              flex: '1 1 auto' /* flex-auto */,
            }}
          >
            {hotel.description}
          </div>
        ) : null}
        <div style={{ marginTop: '1.25rem' }}>
          <button
            type="button"
            onClick={() => {
              if (hotel.price_link) {
                window.open(hotel.price_link, '_blank', 'noopener,noreferrer');
              }
            }}
            style={{
              cursor: hotel.price_link ? 'pointer' : 'default',
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 9999,
              backgroundColor: hotel.price_link ? '#F46C21' : '#cccccc',
              color: '#fff',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              paddingTop: '0.375rem',
              paddingBottom: '0.375rem',
              fontSize: '0.875rem',
              lineHeight: '1.25rem',
              fontWeight: 500,
              opacity: hotel.price_link ? 1 : 0.6,
            }}
            disabled={!hotel.price_link}
          >
            <span>
              {'Book at '} <strong> {` ${hotel.price}`}</strong>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

const element = document.getElementById('ts-resource-carousel');
if (element) {
  createRoot(element).render(<Carousel />);
} else {
  console.error("Cannot find 'ts-resource-carousel'");
}
