import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ToolDefinition } from './types.js';

// Input schema for hotel search
const inputSchema = {
  city: z.string().describe('The name of a city in which to search for hotels'),
  'start-date': z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .describe('Check-in date for the hotel stay (YYYY-MM-DD format)'),
  'end-date': z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .describe('Check-out date for the hotel stay (YYYY-MM-DD format)')
};

// Output schema for hotel search results
const outputSchema = {
  city: z.string().describe('The city that was searched'),
  checkInDate: z.string().optional().describe('The check-in date if provided'),
  checkOutDate: z.string().optional().describe('The check-out date if provided'),
  hotels: z.array(z.object({
    name: z.string().describe('Name of the hotel'),
    price: z.string().describe('Price per night'),
    description: z.string().describe('Brief description of the hotel'),
    rating: z.number().min(1).max(5).describe('Hotel rating from 1 to 5 stars'),
    amenities: z.array(z.string()).describe('List of hotel amenities')
  })).describe('List of available hotels'),
  totalResults: z.number().describe('Total number of hotels found'),
  searchTimestamp: z.string().describe('ISO timestamp when the search was performed')
};

// Static hotel data - will be replaced with backend call later
const STATIC_HOTELS = [
  {
    name: 'Grand Plaza Hotel',
    price: '$249/night',
    description: 'Luxury downtown hotel with panoramic city views and world-class dining',
    rating: 4.5,
    amenities: ['Free Wi-Fi', 'Fitness Center', 'Rooftop Pool', 'Concierge Service', 'Valet Parking']
  },
  {
    name: 'The Boutique Inn',
    price: '$189/night', 
    description: 'Charming boutique hotel in the historic district with unique local character',
    rating: 4.2,
    amenities: ['Free Wi-Fi', 'Continental Breakfast', 'Pet-Friendly', 'Local Art Gallery']
  },
  {
    name: 'Business Center Suites',
    price: '$159/night',
    description: 'Modern business hotel with spacious suites perfect for extended stays',
    rating: 4.0,
    amenities: ['Free Wi-Fi', 'Business Center', 'Kitchenette', 'Laundry Service', 'Airport Shuttle']
  },
  {
    name: 'Seaside Resort & Spa',
    price: '$329/night',
    description: 'Oceanfront resort with full-service spa and private beach access',
    rating: 4.8,
    amenities: ['Free Wi-Fi', 'Private Beach', 'Full Spa', 'Multiple Restaurants', 'Water Sports']
  },
  {
    name: 'Budget Stay Hotel',
    price: '$79/night',
    description: 'Clean and comfortable budget accommodation with essential amenities',
    rating: 3.5,
    amenities: ['Free Wi-Fi', 'Free Parking', '24-Hour Front Desk', 'Vending Machines']
  },
  {
    name: 'Historic Manor House',
    price: '$199/night',
    description: 'Elegant Victorian-era hotel with period furnishings and gardens',
    rating: 4.3,
    amenities: ['Free Wi-Fi', 'Historic Gardens', 'Tea Service', 'Antique Furnishings', 'Event Spaces']
  }
];

// Tool implementation function
async function implementation(args: { city: string; 'start-date'?: string | undefined; 'end-date'?: string | undefined }): Promise<CallToolResult> {
  const { city, 'start-date': startDate, 'end-date': endDate } = args;
  
  // Get today's date string in YYYY-MM-DD format (timezone-safe)
  const todayString = new Date().toISOString().split('T')[0]!;
  
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
  
  // Format response text
  const hotelList = STATIC_HOTELS.map((hotel, index) => 
    `${index + 1}. **${hotel.name}** - ${hotel.price}\n` +
    `   Rating: ${hotel.rating}/5 stars\n` +
    `   ${hotel.description}\n` +
    `   Amenities: ${hotel.amenities.join(', ')}`
  ).join('\n\n');
  
  const dateRange = startDate && endDate ? 
    ` for ${startDate} to ${endDate}` : 
    startDate ? ` starting ${startDate}` : '';
  
  const responseText = `Found ${STATIC_HOTELS.length} hotels in ${city}${dateRange}:\n\n${hotelList}`;
  
  // Structured data matching the output schema
  const structuredData = {
    city,
    checkInDate: startDate,
    checkOutDate: endDate,
    hotels: STATIC_HOTELS,
    totalResults: STATIC_HOTELS.length,
    searchTimestamp: new Date().toISOString()
  };
  
  return {
    content: [
      {
        type: 'text',
        text: responseText,
      },
    ],
    // @ts-ignore - structured content for output schema validation
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
  },
  implementation,
};
