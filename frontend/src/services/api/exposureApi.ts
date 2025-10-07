/**
 * Exposure API Client
 * 
 * Typed API client for Exposure endpoints with comprehensive error handling,
 * request/response logging, and integration testing support.
 * 
 * Features:
 * - Full TypeScript type safety
 * - Axios interceptors for auth and error handling
 * - Request/response logging for debugging
 * - Consistent error formatting
 * - Retry logic for transient failures
 * - Integration testing helpers
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import {
  Exposure,
  CreateExposureInput,
  UpdateExposureInput,
  ExposureQueryParams,
  ExposureSearchParams,
  ExposureStatistics,
  ApiResponse,
  PaginatedResponse,
  ValidationError as ValidationErrorType,
} from '../../types/models';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api/v1';
const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// ============================================================================
// TYPES
// ============================================================================

interface RequestLogEntry {
  timestamp: string;
  method: string;
  url: string;
  params?: any;
  data?: any;
  headers?: any;
}

interface ResponseLogEntry {
  timestamp: string;
  status: number;
  statusText: string;
  data: any;
  duration: number;
}

interface ErrorLogEntry {
  timestamp: string;
  message: string;
  status?: number;
  details?: any;
  stack?: string;
}

export interface ExposureApiConfig {
  enableLogging?: boolean;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  onRequest?: (log: RequestLogEntry) => void;
  onResponse?: (log: ResponseLogEntry) => void;
  onError?: (log: ErrorLogEntry) => void;
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class ExposureApiError extends Error {
  public status?: number;
  public code?: string;
  public details?: ValidationErrorType[];
  public originalError?: any;

  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: ValidationErrorType[],
    originalError?: any
  ) {
    super(message);
    this.name = 'ExposureApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.originalError = originalError;
  }
}

export class ApiValidationError extends Error {
  public fields: ValidationErrorType[];

  constructor(message: string, fields: ValidationErrorType[]) {
    super(message);
    this.name = 'ApiValidationError';
    this.fields = fields;
  }
}

export class NetworkError extends ExposureApiError {
  constructor(message: string, originalError?: any) {
    super(message, undefined, 'NETWORK_ERROR', undefined, originalError);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ExposureApiError {
  constructor(message: string = 'Request timeout') {
    super(message, 408, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}

// ============================================================================
// AXIOS INSTANCE CONFIGURATION
// ============================================================================

class ExposureApiClient {
  private client: AxiosInstance;
  private config: ExposureApiConfig;
  private requestLog: RequestLogEntry[] = [];
  private responseLog: ResponseLogEntry[] = [];
  private errorLog: ErrorLogEntry[] = [];

  constructor(config: ExposureApiConfig = {}) {
    this.config = {
      enableLogging: true,
      enableRetry: true,
      maxRetries: MAX_RETRIES,
      retryDelay: RETRY_DELAY,
      ...config,
    };

    this.client = axios.create({
      baseURL: `${API_BASE_URL}/exposures`,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // ==========================================================================
  // INTERCEPTORS
  // ==========================================================================

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const startTime = Date.now();
        (config as any).startTime = startTime;

        if (this.config.enableLogging) {
          const logEntry: RequestLogEntry = {
            timestamp: new Date().toISOString(),
            method: config.method?.toUpperCase() || 'GET',
            url: config.url || '',
            params: config.params,
            data: config.data,
            headers: config.headers,
          };
          this.requestLog.push(logEntry);
          this.config.onRequest?.(logEntry);

          console.log(`[API Request] ${logEntry.method} ${logEntry.url}`, {
            params: logEntry.params,
            data: logEntry.data,
          });
        }

        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        const duration = Date.now() - ((response.config as any).startTime || 0);

        if (this.config.enableLogging) {
          const logEntry: ResponseLogEntry = {
            timestamp: new Date().toISOString(),
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            duration,
          };
          this.responseLog.push(logEntry);
          this.config.onResponse?.(logEntry);

          console.log(
            `[API Response] ${response.status} ${response.statusText} (${duration}ms)`,
            response.data
          );
        }

        return response;
      },
      async (error: AxiosError) => {
        return this.handleError(error);
      }
    );
  }

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  private async handleError(error: AxiosError): Promise<never> {
    const logEntry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      message: error.message,
      status: error.response?.status,
      details: error.response?.data,
      stack: error.stack,
    };

    if (this.config.enableLogging) {
      this.errorLog.push(logEntry);
      this.config.onError?.(logEntry);

      console.error('[API Error]', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      throw new TimeoutError();
    }

    if (!error.response) {
      throw new NetworkError('Network error - unable to reach server', error);
    }

    const { status, data } = error.response;
    const responseData = data as any;

    // Handle validation errors (400)
    if (status === 400 && responseData.details) {
      throw new ApiValidationError(
        responseData.error || 'Validation failed',
        responseData.details
      );
    }

    // Handle not found (404)
    if (status === 404) {
      throw new ExposureApiError(
        responseData.error || 'Resource not found',
        404,
        'NOT_FOUND'
      );
    }

    // Handle unauthorized (401)
    if (status === 401) {
      // Clear auth token
      localStorage.removeItem('authToken');
      throw new ExposureApiError(
        'Unauthorized - please log in again',
        401,
        'UNAUTHORIZED'
      );
    }

    // Handle forbidden (403)
    if (status === 403) {
      throw new ExposureApiError(
        'Forbidden - insufficient permissions',
        403,
        'FORBIDDEN'
      );
    }

    // Handle server errors (500)
    if (status >= 500) {
      // Retry logic for server errors
      if (this.config.enableRetry && error.config && !(error.config as any).__retryCount) {
        return this.retryRequest(error.config);
      }

      throw new ExposureApiError(
        responseData.error || 'Internal server error',
        status,
        'SERVER_ERROR',
        undefined,
        error
      );
    }

    // Generic error
    throw new ExposureApiError(
      responseData.error || error.message || 'An unexpected error occurred',
      status,
      'API_ERROR',
      undefined,
      error
    );
  }

  private async retryRequest(config: AxiosRequestConfig): Promise<never> {
    const retryCount = ((config as any).__retryCount || 0) + 1;
    const maxRetries = this.config.maxRetries || MAX_RETRIES;

    if (retryCount > maxRetries) {
      throw new ExposureApiError(
        `Max retries (${maxRetries}) exceeded`,
        undefined,
        'MAX_RETRIES_EXCEEDED'
      );
    }

    (config as any).__retryCount = retryCount;

    console.log(`[API Retry] Attempt ${retryCount}/${maxRetries}`);

    // Wait before retrying
    await new Promise((resolve) =>
      setTimeout(resolve, this.config.retryDelay! * retryCount)
    );

    return this.client.request(config);
  }

  // ==========================================================================
  // LOGGING HELPERS
  // ==========================================================================

  public getRequestLog(): RequestLogEntry[] {
    return [...this.requestLog];
  }

  public getResponseLog(): ResponseLogEntry[] {
    return [...this.responseLog];
  }

  public getErrorLog(): ErrorLogEntry[] {
    return [...this.errorLog];
  }

  public clearLogs(): void {
    this.requestLog = [];
    this.responseLog = [];
    this.errorLog = [];
  }

  public getLastRequest(): RequestLogEntry | undefined {
    return this.requestLog[this.requestLog.length - 1];
  }

  public getLastResponse(): ResponseLogEntry | undefined {
    return this.responseLog[this.responseLog.length - 1];
  }

  public getLastError(): ErrorLogEntry | undefined {
    return this.errorLog[this.errorLog.length - 1];
  }

  // ==========================================================================
  // API METHODS
  // ==========================================================================

  /**
   * Get list of exposures with pagination and filters
   * @param params Query parameters for filtering, pagination, sorting
   * @returns Paginated list of exposures
   */
  async getExposures(
    params?: ExposureQueryParams
  ): Promise<PaginatedResponse<Exposure>> {
    const response = await this.client.get<PaginatedResponse<Exposure>>('/', {
      params,
    });
    return response.data;
  }

  /**
   * Get a single exposure by ID
   * @param id Exposure ID
   * @returns Single exposure object
   */
  async getExposureById(id: string): Promise<ApiResponse<Exposure>> {
    const response = await this.client.get<ApiResponse<Exposure>>(`/${id}`);
    return response.data;
  }

  /**
   * Create a new exposure
   * @param data Exposure data to create
   * @returns Created exposure object
   */
  async createExposure(
    data: CreateExposureInput
  ): Promise<ApiResponse<Exposure>> {
    const response = await this.client.post<ApiResponse<Exposure>>('/', data);
    return response.data;
  }

  /**
   * Update an existing exposure
   * @param id Exposure ID
   * @param data Partial exposure data to update
   * @returns Updated exposure object
   */
  async updateExposure(
    id: string,
    data: UpdateExposureInput
  ): Promise<ApiResponse<Exposure>> {
    const response = await this.client.put<ApiResponse<Exposure>>(
      `/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Delete an exposure
   * @param id Exposure ID
   * @returns Success response
   */
  async deleteExposure(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete<ApiResponse<void>>(`/${id}`);
    return response.data;
  }

  /**
   * Get exposures for a specific account
   * @param accountId Account ID
   * @param params Additional query parameters
   * @returns List of exposures for the account
   */
  async getExposuresByAccount(
    accountId: string,
    params?: Omit<ExposureQueryParams, 'accountId'>
  ): Promise<ApiResponse<Exposure[]>> {
    const response = await this.client.get<ApiResponse<Exposure[]>>(
      `/account/${accountId}`,
      { params }
    );
    return response.data;
  }

  /**
   * Get exposures for a specific location
   * @param locationId Location ID
   * @param params Additional query parameters
   * @returns List of exposures for the location
   */
  async getExposuresByLocation(
    locationId: string,
    params?: Omit<ExposureQueryParams, 'locationId'>
  ): Promise<ApiResponse<Exposure[]>> {
    const response = await this.client.get<ApiResponse<Exposure[]>>(
      `/location/${locationId}`,
      { params }
    );
    return response.data;
  }

  /**
   * Get exposures for a specific policy
   * @param policyId Policy ID
   * @param params Additional query parameters
   * @returns List of exposures for the policy
   */
  async getExposuresByPolicy(
    policyId: string,
    params?: Omit<ExposureQueryParams, 'policyId'>
  ): Promise<ApiResponse<Exposure[]>> {
    const response = await this.client.get<ApiResponse<Exposure[]>>(
      `/policy/${policyId}`,
      { params }
    );
    return response.data;
  }

  /**
   * Create multiple exposures in bulk
   * @param exposures Array of exposure data to create
   * @returns Array of created exposure objects
   */
  async createBulkExposures(
    exposures: CreateExposureInput[]
  ): Promise<ApiResponse<Exposure[]>> {
    const response = await this.client.post<ApiResponse<Exposure[]>>(
      '/bulk',
      { exposures }
    );
    return response.data;
  }

  /**
   * Search exposures with advanced filters
   * @param params Search parameters including search term
   * @returns Paginated list of matching exposures
   */
  async searchExposures(
    params: ExposureSearchParams
  ): Promise<PaginatedResponse<Exposure>> {
    const response = await this.client.get<PaginatedResponse<Exposure>>(
      '/search',
      { params }
    );
    return response.data;
  }

  /**
   * Get exposure statistics
   * @param accountId Optional account ID to filter statistics
   * @returns Aggregated exposure statistics
   */
  async getExposureStatistics(
    accountId?: string
  ): Promise<ApiResponse<ExposureStatistics>> {
    const response = await this.client.get<ApiResponse<ExposureStatistics>>(
      '/statistics/summary',
      {
        params: accountId ? { accountId } : undefined,
      }
    );
    return response.data;
  }

  /**
   * Check if an exposure exists by ID (lightweight)
   * @param id Exposure ID
   * @returns True if exposure exists
   */
  async exposureExists(id: string): Promise<boolean> {
    try {
      await this.client.head(`/${id}`);
      return true;
    } catch (error) {
      if ((error as ExposureApiError).status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get exposure count for filters (without fetching data)
   * @param params Query parameters for filtering
   * @returns Total count matching filters
   */
  async getExposureCount(params?: ExposureQueryParams): Promise<number> {
    const response = await this.getExposures({ ...params, limit: 1 });
    return response.pagination.total;
  }

  // ==========================================================================
  // BATCH OPERATIONS
  // ==========================================================================

  /**
   * Update multiple exposures in batch
   * @param updates Array of {id, data} objects
   * @returns Array of update results
   */
  async batchUpdateExposures(
    updates: Array<{ id: string; data: UpdateExposureInput }>
  ): Promise<Array<ApiResponse<Exposure>>> {
    const promises = updates.map(({ id, data }) =>
      this.updateExposure(id, data)
    );
    return Promise.all(promises);
  }

  /**
   * Delete multiple exposures in batch
   * @param ids Array of exposure IDs
   * @returns Array of deletion results
   */
  async batchDeleteExposures(
    ids: string[]
  ): Promise<Array<ApiResponse<void>>> {
    const promises = ids.map((id) => this.deleteExposure(id));
    return Promise.all(promises);
  }

  // ==========================================================================
  // TESTING HELPERS
  // ==========================================================================

  /**
   * Test connection to API
   * @returns True if connection successful
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getExposures({ limit: 1 });
      return true;
    } catch (error) {
      console.error('[API Test] Connection failed:', error);
      return false;
    }
  }

  /**
   * Get API health status
   * @returns Health check information
   */
  async getHealthStatus(): Promise<{
    connected: boolean;
    latency?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    try {
      await this.getExposures({ limit: 1 });
      const latency = Date.now() - startTime;
      return { connected: true, latency };
    } catch (error) {
      return {
        connected: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Mock API responses for testing (use in test environment only)
   * @param mockData Mock response data
   */
  mockResponses(mockData: Record<string, any>): void {
    // This would be implemented with a mocking library like MSW or axios-mock-adapter
    // For now, this is a placeholder
    console.warn('[API Mock] Mocking not implemented in production client');
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

// Default instance for general use
export const exposureApi = new ExposureApiClient();

// Factory function for creating custom instances (useful for testing)
export const createExposureApiClient = (
  config?: ExposureApiConfig
): ExposureApiClient => {
  return new ExposureApiClient(config);
};

// Export the class for advanced usage
export { ExposureApiClient };

// Export convenience type
export type ExposureApi = ExposureApiClient;

// ============================================================================
// USAGE EXAMPLES (for documentation)
// ============================================================================

/*
// Basic usage:
import { exposureApi } from './services/api/exposureApi';

// Get exposures with pagination
const response = await exposureApi.getExposures({ page: 1, limit: 20 });

// Get single exposure
const exposure = await exposureApi.getExposureById('EXP-000001');

// Create new exposure
const newExposure = await exposureApi.createExposure({
  exposureId: 'EXP-NEW-001',
  exposureType: 'Property',
  accountId: 'ACC-000001',
  // ... other fields
});

// Update exposure
const updated = await exposureApi.updateExposure('EXP-000001', {
  totalInsuredValue: 1500000,
});

// Delete exposure
await exposureApi.deleteExposure('EXP-000001');

// Search exposures
const searchResults = await exposureApi.searchExposures({
  q: 'residential',
  exposureType: 'Property',
  page: 1,
});

// Get statistics
const stats = await exposureApi.getExposureStatistics('ACC-000001');

// Custom instance with logging callbacks:
import { createExposureApiClient } from './services/api/exposureApi';

const customApi = createExposureApiClient({
  enableLogging: true,
  onRequest: (log) => console.log('Request:', log),
  onResponse: (log) => console.log('Response:', log),
  onError: (log) => console.error('Error:', log),
});

// Testing helpers:
const isConnected = await exposureApi.testConnection();
const health = await exposureApi.getHealthStatus();

// Batch operations:
await exposureApi.batchUpdateExposures([
  { id: 'EXP-001', data: { status: 'Inactive' } },
  { id: 'EXP-002', data: { status: 'Inactive' } },
]);

// Logging inspection:
const lastRequest = exposureApi.getLastRequest();
const lastResponse = exposureApi.getLastResponse();
const lastError = exposureApi.getLastError();
*/
