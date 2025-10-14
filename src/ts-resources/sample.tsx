/**
 * Sample TypeScript file demonstrating various TypeScript features
 * This file showcases interfaces, generics, classes, and advanced types
 */

// Interface for user data
interface User {
  id: number;
  name: string;
  email: string;
  isActive?: boolean;
}

// Generic interface for API responses
interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  timestamp: Date;
  message?: string;
}

/**
 * A sample class that demonstrates TypeScript class features
 */
export class UserManager {
  private users: Map<number, User> = new Map();
  
  constructor(initialUsers: User[] = []) {
    initialUsers.forEach(user => this.addUser(user));
  }
  
  public addUser(user: User): void {
    this.users.set(user.id, { ...user, isActive: user.isActive ?? true });
  }
  
  public getUser(id: number): User | undefined {
    return this.users.get(id);
  }
  
  public getAllUsers(): User[] {
    return Array.from(this.users.values());
  }
  
  public getActiveUsers(): User[] {
    return this.getAllUsers().filter(user => user.isActive === true);
  }
  
  public updateUser(id: number, updates: Partial<User>): boolean {
    const user = this.users.get(id);
    if (!user) {
      return false;
    }
    
    this.users.set(id, { ...user, ...updates });
    return true;
  }
  
  public deleteUser(id: number): boolean {
    return this.users.delete(id);
  }
  
  public getUserCount(): number {
    return this.users.size;
  }
}

// Utility function with TypeScript generics
export function createArray<T>(length: number, fillValue: T): T[] {
  return Array(length).fill(fillValue);
}

// Advanced TypeScript utility types
export type UserWithoutId = Omit<User, 'id'>;
export type UserUpdate = Partial<Pick<User, 'name' | 'email' | 'isActive'>>;

// Function that uses the generic ApiResponse type
export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  const response: ApiResponse<T> = {
    data,
    status: 'success',
    timestamp: new Date()
  };
  
  if (message !== undefined) {
    response.message = message;
  }
  
  return response;
}

export function createErrorResponse(message: string): ApiResponse<null> {
  return {
    data: null,
    status: 'error',
    timestamp: new Date(),
    message
  };
}

// Example usage and demonstration functions
export function demonstrateTypeScript(): string {
  const userManager = new UserManager();
  
  // Add some sample users
  userManager.addUser({ id: 1, name: 'Alice', email: 'alice@example.com' });
  userManager.addUser({ id: 2, name: 'Bob', email: 'bob@example.com', isActive: false });
  
  // Use generic functions
  const numbers = createArray(5, 42);
  const strings = createArray(3, 'hello');
  
  // Create API responses
  const successResponse = createSuccessResponse(userManager.getAllUsers(), 'Users retrieved successfully');
  const errorResponse = createErrorResponse('Something went wrong');
  
  return `TypeScript demonstration complete. Users: ${userManager.getUserCount()}, Numbers: ${numbers.length}, Strings: ${strings.length}, Responses: ${successResponse.status}, ${errorResponse.status}`;
}

export default UserManager;
