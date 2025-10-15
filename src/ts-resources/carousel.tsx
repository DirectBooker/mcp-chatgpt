import { createRoot } from 'react-dom/client';
import useEmblaCarousel from 'embla-carousel-react';

// openai-hooks.ts
import { useSyncExternalStore } from 'react';

const SET_GLOBALS_EVENT_TYPE = 'openai:set_globals' as const;

function useOpenAiGlobal<K extends keyof any>(key: K) {
  return useSyncExternalStore(
    onChange => {
      const handler = (e: CustomEvent<{ globals: Partial<any> }>) => {
        // Only re-render when the updated key is present (host may patch multiple keys)
        if (e.detail.globals[key] !== undefined) onChange();
      };
      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handler as EventListener, { passive: true });
      return () => window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handler as EventListener);
    },
    // Snapshot: always read through the proxy (correct source of truth)
    () => (window as any).openai[key]
  );
}

function useToolOutput<T = unknown>() {
  return useOpenAiGlobal('toolOutput') as T | null;
}

/**
 * Simple carousel component with a timestamp message
 *
 * @mcp-name: "Carousel Component"
 * @mcp-description: "A simple div showing when George was here"
 * @mcp-uri: "carousel"
 */

// TODO(george): DRY
interface HotelType {
  hotel_id: number;
  name: string;
  carousel_image: string;
  description?: string;
  price: string;
  price_link: string;
  rating: number;
}

function Foobar() {
  const [emblaRef] = useEmblaCarousel({ dragFree: true });
  console.error(`The embla ref: ${emblaRef}`);

  const toolOutput: { hotels: Array<HotelType> } = useToolOutput<any>();
  console.log('Frobnitz', toolOutput);

  if (toolOutput) {
    const count = (toolOutput.hotels as Array<unknown>).length;
    console.error('the count: ', count);
  }

  const hotels: Array<HotelType> = toolOutput?.hotels || [];

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
  hotel: HotelType;
}

function HotelCard({ hotel }: HotelCardProps) {
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
            <span>{"Book at "} <strong> {` ${hotel.price}`}</strong></span>
          </button>
        </div>
      </div>
    </div>
  );
}

const element = document.getElementById('ts-resource-carousel');
if (element) {
  createRoot(element).render(<Foobar />);
} else {
  console.error("Cannot find 'ts-resource-carousel'");
}
