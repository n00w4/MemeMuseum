// Base interface for API responses
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}
