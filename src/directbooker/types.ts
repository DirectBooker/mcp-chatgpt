// export interface HotelType {
//   hotel_id: number;
//   name: string;
//   carousel_image: string;
//   description?: string;
//   price: string;
//   price_link: string;
//   rating: number;
// }

export interface Hotel {
  hotel_id?: number | undefined;
  property_token: string;
  name: string;
  price: string;
  price_link?: string | undefined;
  description: string;
  rating: number;
  amenities: string[];
  carousel_image?: string | undefined;
}
