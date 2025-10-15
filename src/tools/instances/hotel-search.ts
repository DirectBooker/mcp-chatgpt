import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ToolDefinition } from '../types.js';
import { createSaltedUri } from '../../resources/typescript-resource-factory.js';

// Input schema for hotel search
const inputSchema = {
  city: z.string().describe('The name of a city in which to search for hotels'),
  'start-date': z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .describe('Check-in date for the hotel stay (YYYY-MM-DD format)'),
  'end-date': z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .describe('Check-out date for the hotel stay (YYYY-MM-DD format)'),
};

// Output schema for hotel search results
const outputSchema = {
  city: z.string().describe('The city that was searched'),
  checkInDate: z.string().optional().describe('The check-in date if provided'),
  checkOutDate: z.string().optional().describe('The check-out date if provided'),
  hotels: z.array(
    z
      .object({
        name: z.string().describe('Name of the hotel'),
        price: z.string().describe('Price per night'),
        price_link: z
          .string()
          .optional()
          .describe('URL link associated with the price for booking or more details'),
        description: z.string().describe('Brief description of the hotel'),
        rating: z.number().min(1).max(5).describe('Hotel rating from 1 to 5 stars'),
        amenities: z.array(z.string()).describe('List of hotel amenities'),
        'hotel-id': z
          .number()
          .optional()
          .describe('A persistent id for this hotel which can be used with other tools'),
        'property-token': z
          .string()
          .describe(
            'A persistent id for this hotel which can be used with other tools. Prefer the hotel-id field, if present'
          ),
        carousel_image: z
          .string()
          .optional()
          .describe('Thumbnail image URL for the hotel, if available'),
      })
      .describe('Individual hotel information')
  ),
  totalResults: z.number().describe('Total number of hotels found'),
  searchTimestamp: z.string().describe('ISO timestamp when the search was performed'),
};

// API response interfaces
interface ApiResponse {
  properties?: PropertyData[];
}

interface PropertyData {
  name?: string;
  display_price?: {
    price?: {
      price_per_night?: string;
    };
    reservation_link?: string;
  };
  location_data?: {
    address_structured?: {
      city?: string;
    };
  };
  amenities?: string[];
  review_rating?: number;
  photos?: Array<{
    thumbnail_url?: string;
  }>;
  'hotel-id'?: number;
  hotel_id?: number;
  'property-token'?: string;
  property_token?: string;
  token?: string;
}

// Hotel interface for type safety
interface Hotel {
  name: string;
  price: string;
  price_link?: string | undefined;
  description: string;
  rating: number;
  amenities: string[];
  'hotel-id'?: number | undefined;
  'property-token': string;
  carousel_image?: string | undefined;
}

// Tool implementation function
async function implementation(args: {
  city: string;
  'start-date'?: string | undefined;
  'end-date'?: string | undefined;
}): Promise<CallToolResult> {
  const { city, 'start-date': startDate, 'end-date': endDate } = args;

  // Get today's date string in YYYY-MM-DD format (timezone-safe)
  const todayString = new Date().toISOString().split('T')[0] ?? '';

  // Validate dates are not in the past (string comparison is timezone-safe)
  if (startDate) {
    if (startDate < todayString) {
      throw new Error('Check-in date cannot be in the past');
    }
  }

  if (endDate) {
    if (endDate < todayString) {
      throw new Error('Check-out date cannot be in the past');
    }
  }

  // Validate date logic if both dates are provided
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new Error('Check-out date must be after check-in date');
    }
  }

  // Build API URL
  // TODO(george): Add 'mcp' parameter to request and limit response length for better performance
  let apiUrl = `https://www.directbooker.com/api/search?q=${encodeURIComponent(city)}`;
  if (startDate) {
    apiUrl += `&sd=${startDate}`;
  }
  if (endDate) {
    apiUrl += `&ed=${endDate}`;
  }

  // Call the DirectBooker API
  const apiResponse = await fetch(apiUrl);
  if (!apiResponse.ok) {
    throw new Error(`API request failed: ${apiResponse.status} ${apiResponse.statusText}`);
  }

  const apiData = (await apiResponse.json()) as ApiResponse;

  // Map API response to our format (limit to 8 results)
  const hotels: Hotel[] = (apiData.properties || []).map((property: PropertyData) => {
    // Create description from location and top amenities
    const location = property.location_data?.address_structured?.city || city;
    const topAmenities = (property.amenities || []).slice(0, 3).join(', ');
    const description = topAmenities
      ? `Located in ${location}. Features: ${topAmenities}`
      : `Hotel located in ${location}`;

    // Extract carousel image from first photo's thumbnail_url
    const carouselImage = property.photos?.[0]?.thumbnail_url || undefined;

    return {
      name: property.name || 'Unknown Hotel',
      price: property.display_price?.price?.price_per_night || 'Price not available',
      price_link: property.display_price?.reservation_link || undefined,
      description,
      rating: property.review_rating || 0,
      amenities: property.amenities || [],
      'hotel-id': property['hotel-id'] || property.hotel_id || undefined,
      'property-token':
        property['property-token'] || property.property_token || property.token || 'unknown',
      carousel_image: carouselImage,
    };
  });

  // Format response text
  const hotelList = hotels
    .map(
      (hotel, index) =>
        `${index + 1}. **${hotel.name}** - ${hotel.price}\n` +
        `   Rating: ${hotel.rating}/5 stars\n` +
        `   ${hotel.description}\n` +
        `   Amenities: ${hotel.amenities.join(', ')}`
    )
    .join('\n\n');

  const dateRange =
    startDate && endDate
      ? ` for ${startDate} to ${endDate}`
      : startDate
        ? ` starting ${startDate}`
        : '';

  const responseText =
    hotels.length > 0
      ? `Found ${hotels.length} hotels in ${city}${dateRange}:\n\n${hotelList}`
      : `No hotels found in ${city}${dateRange}. Please try a different city or date range.`;

  // Structured data matching the output schema
  const structuredData = {
    city,
    checkInDate: startDate,
    checkOutDate: endDate,
    hotels,
    totalResults: hotels.length,
    searchTimestamp: new Date().toISOString(),
  };

  return {
    content: [
      {
        type: 'text',
        text: responseText,
      },
    ],
    structuredContent: structuredData,
  };
}

// Export the tool definition
export const hotelSearchTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  config: {
    name: 'hotel-search',
    description: 'Search for hotels in a specified city with optional check-in and check-out dates',
    inputSchema,
    outputSchema,
    annotations: { readOnlyHint: true },
    _meta: {
      get 'openai/outputTemplate'(): string {
        return createSaltedUri('carousel');
      },
      'openai/toolInvocation/invoking': 'Loading the hotel list',
      'openai/toolInvocation/invoked': 'Displayed the hotel list',
    },
  },
  implementation,
};
