import React from 'react';
import { Hotel } from '../directbooker/types';

export const HotelTitle = ({ hotel }: { hotel: Hotel }): React.JSX.Element => {
  return <div className="text-base font-medium truncate line-clamp-1">{hotel.name}</div>;
};

export const Star = (): React.JSX.Element => {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="#fbbf24"
      stroke="#444"
      strokeWidth="0.5"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
};

export const HotelRating = ({ hotel }: { hotel: Hotel }): React.JSX.Element => {
  return (
    <div className="text-xs mt-1 text-black/60 flex items-center gap-1">
      <span className="flex items-center gap-1">
        <Star />
        {hotel.rating?.toFixed ? hotel.rating.toFixed(1) : hotel.rating}
      </span>
      {hotel.price ? <span>· {hotel.price}</span> : null}
    </div>
  );
};

export const HotelDescription = ({ hotel }: { hotel: Hotel }): React.JSX.Element | null => {
  if (!hotel.description) {
    return null;
  }

  return <div className="text-sm mt-2 text-black/80 flex-auto">{hotel.description}</div>;
};

export const HotelImage = ({ hotel }: { hotel: Hotel }): React.JSX.Element => {
  // TODO(george): Add image fallback
  return (
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
  );
};

export const HotelPriceButton = ({ hotel }: { hotel: Hotel }): React.JSX.Element => {
  return (
    <div style={{ marginTop: '1.25rem' }}>
      <button
        type="button"
        onClick={() => {
          if (hotel.price_link) {
            window.open(hotel.price_link, '_blank', 'noopener,noreferrer');
          }
        }}
        className="cursor-pointer inline-flex items-center rounded-full bg-[#F46C21] text-white px-4 py-1.5 text-sm font-medium hover:opacity-90 active:opacity-100"
        disabled={!hotel.price_link}
      >
        <span>
          {'Book at '} <strong> {` ${hotel.price}`}</strong>
        </span>
      </button>
    </div>
  );
};
