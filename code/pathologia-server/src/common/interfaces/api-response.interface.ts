export interface ApiSuccessResponse<T = unknown> {
  readonly success: true;
  readonly message: string;
  readonly data: T;
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly message: string;
  readonly errors: string[];
}
