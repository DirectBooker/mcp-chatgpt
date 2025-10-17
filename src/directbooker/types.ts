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
  latitude?: number | undefined;
  longitude?: number | undefined;
}
