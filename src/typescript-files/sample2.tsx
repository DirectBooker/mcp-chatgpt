/**
 * Second TypeScript sample demonstrating async/await, decorators, and advanced patterns
 * This showcases different TypeScript features from sample.tsx
 */

// Enum for HTTP methods
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

// Type for HTTP status codes
export type HttpStatus = 200 | 201 | 400 | 401 | 403 | 404 | 500;

// Interface for API configuration
interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers?: Record<string, string>;
}

// Interface for API request
interface ApiRequest<TBody = unknown> {
  method: HttpMethod;
  endpoint: string;
  body?: TBody;
  headers?: Record<string, string>;
}

// Interface for API response
interface ApiResponse<TData = unknown> {
  status: HttpStatus;
  data: TData;
  headers: Record<string, string>;
  timestamp: Date;
}

// Custom error class
export class ApiError extends Error {
  public readonly status: HttpStatus;
  public readonly response?: ApiResponse;

  constructor(message: string, status: HttpStatus, response?: ApiResponse) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    if (response !== undefined) {
      this.response = response;
    }
  }
}

// Generic API client class with async methods
export class ApiClient {
  private readonly config: ApiConfig;
  private readonly requestCount: number = 0;

  constructor(config: ApiConfig) {
    this.config = { ...config };
  }

  // Generic GET method with type safety
  public async get<TResponse>(endpoint: string): Promise<ApiResponse<TResponse>> {
    return this.makeRequest<TResponse>({
      method: HttpMethod.GET,
      endpoint
    });
  }

  // Generic POST method with request body typing
  public async post<TRequest, TResponse>(
    endpoint: string, 
    body: TRequest
  ): Promise<ApiResponse<TResponse>> {
    return this.makeRequest<TResponse>({
      method: HttpMethod.POST,
      endpoint,
      body
    });
  }

  // Private method with async/await and error handling
  private async makeRequest<TResponse>(
    request: ApiRequest
  ): Promise<ApiResponse<TResponse>> {
    // Simulate API delay
    await this.delay(100);
    
    try {
      // Simulate network request (in real implementation, would use fetch)
      const mockResponse: ApiResponse<TResponse> = {
        status: 200 as HttpStatus,
        data: this.generateMockData<TResponse>(request),
        headers: { 'content-type': 'application/json' },
        timestamp: new Date()
      };

      return mockResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new ApiError(`Request failed: ${errorMessage}`, 500);
    }
  }

  // Utility method with generics
  private generateMockData<T>(request: ApiRequest): T {
    const mockData = {
      message: `Mock response for ${request.method} ${request.endpoint}`,
      timestamp: new Date().toISOString(),
      requestBody: request.body
    };
    
    return mockData as T;
  }

  // Async utility method
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Method with async iterator (advanced TypeScript feature)
  public async* streamData<T>(endpoint: string, batchSize: number = 10): AsyncIterableIterator<T[]> {
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await this.get<T[]>(`${endpoint}?offset=${offset}&limit=${batchSize}`);
      const batch = response.data;
      
      if (batch.length === 0) {
        hasMore = false;
      } else {
        yield batch;
        offset += batchSize;
      }
      
      // Simulate that we only have 3 batches
      if (offset >= batchSize * 3) {
        hasMore = false;
      }
    }
  }

  // Method demonstrating promise combinators
  public async batchRequests<T>(endpoints: string[]): Promise<ApiResponse<T>[]> {
    const promises = endpoints.map(endpoint => this.get<T>(endpoint));
    
    try {
      // Promise.allSettled for handling mixed success/failure
      const results = await Promise.allSettled(promises);
      
      return results
        .filter((result): result is PromiseFulfilledResult<ApiResponse<T>> => 
          result.status === 'fulfilled')
        .map(result => result.value);
    } catch (error) {
      throw new ApiError('Batch request failed', 500);
    }
  }

  // Getter with computed property
  public get requestStats(): { count: number; baseUrl: string; timeout: number } {
    return {
      count: this.requestCount,
      baseUrl: this.config.baseUrl,
      timeout: this.config.timeout
    };
  }
}

// Conditional types (advanced TypeScript feature)
export type ApiResult<T> = T extends string 
  ? { text: T; length: number } 
  : T extends number 
    ? { value: T; isPositive: boolean }
    : { data: T; type: string };

// Utility function with conditional types
export function processApiResult<T>(input: T): ApiResult<T> {
  if (typeof input === 'string') {
    return { text: input, length: input.length } as ApiResult<T>;
  } else if (typeof input === 'number') {
    return { value: input, isPositive: input > 0 } as ApiResult<T>;
  } else {
    return { data: input, type: typeof input } as ApiResult<T>;
  }
}

// Demonstration function
export async function demonstrateAsyncApi(): Promise<string> {
  const apiClient = new ApiClient({
    baseUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3,
    headers: { 'Authorization': 'Bearer token123' }
  });

  try {
    // Make some API calls
    const userResponse = await apiClient.get<{ name: string; id: number }>('/users/1');
    await apiClient.post('/users', { name: 'New User', email: 'user@example.com' });

    // Demonstrate streaming
    let batchCount = 0;
    for await (const batch of apiClient.streamData('/data', 5)) {
      console.log(`Processed batch ${++batchCount} of ${batch.length} items`);
    }

    // Batch requests
    const batchResults = await apiClient.batchRequests(['/users/1', '/users/2', '/users/3']);

    return `Async demo complete. User: ${JSON.stringify(userResponse.data)}, Batches: ${batchResults.length}`;
  } catch (error) {
    if (error instanceof ApiError) {
      return `API Error: ${error.message} (Status: ${error.status})`;
    }
    return `Unknown error: ${error}`;
  }
}

export default ApiClient;