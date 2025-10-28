import React from 'react';
import { createRoot } from 'react-dom/client';
import useEmblaCarousel from 'embla-carousel-react';
import { useToolOutput } from '../shared/open-ai-globals';
import { Hotel } from '../directbooker/types';
import {
  HotelTitle,
  HotelRating,
  HotelDescription,
  HotelImage,
  HotelPriceButton,
} from '../components/hotels';
import { hotelCardContainerClasses } from '../shared/classnames';

const Carousel = (): React.JSX.Element => {
  return <HotelCarousel />;
};

function HotelCarousel(): React.JSX.Element {
  const [emblaRef] = useEmblaCarousel({ dragFree: true });

  const toolOutput = useToolOutput<{ hotels: Array<Hotel> }>();
  const hotels: Array<Hotel> = toolOutput?.hotels || [];

  return (
    <div className="embla overflow-hidden" ref={emblaRef}>
      <div className="embla__container flex">
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
    <div className={hotelCardContainerClasses()}>
      <HotelImage hotel={hotel} />
      <div className="flex flex-col flex-1 mt-3 flex-auto combined">
        <HotelTitle hotel={hotel} />
        <HotelRating hotel={hotel} />
        <HotelDescription hotel={hotel} />
        <HotelPriceButton hotel={hotel} />
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
