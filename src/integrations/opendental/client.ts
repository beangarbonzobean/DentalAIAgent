import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import logger from '../../utils/logger.js';

/**
 * Open Dental FHIR API client with retry logic and authentication
 */

const OPENDENTAL_API_URL = process.env.OPENDENTAL_API_URL || 'https://api.opendental.com/api/v1';
const OPENDENTAL_DEVELOPER_KEY = process.env.OPENDENTAL_DEVELOPER_KEY;
const OPENDENTAL_CUSTOMER_KEY = process.env.OPENDENTAL_CUSTOMER_KEY || '';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Create Axios client with authentication headers
 */
export const openDentalClient: AxiosInstance = axios.create({
  baseURL: OPENDENTAL_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add authentication headers if keys are available
if (OPENDENTAL_DEVELOPER_KEY) {
  openDentalClient.defaults.headers.common['Authorization'] = OPENDENTAL_DEVELOPER_KEY;
}

if (OPENDENTAL_CUSTOMER_KEY) {
  openDentalClient.defaults.headers.common['Customer-Key'] = OPENDENTAL_CUSTOMER_KEY;
}

/**
 * Request interceptor for logging
 */
openDentalClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    logger.debug('Open Dental API Request', {
      method: config.method?.toUpperCase(),
      url: config.url,
      params: config.params,
    });
    return config;
  },
  (error: AxiosError) => {
    logger.error('Open Dental API Request Error', { error: error.message });
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for logging and retry logic
 */
openDentalClient.interceptors.response.use(
  (response: AxiosResponse) => {
    logger.debug('Open Dental API Response', {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { retryCount?: number };
    
    if (!config) {
      return Promise.reject(error);
    }

    // Initialize retry count
    config.retryCount = config.retryCount || 0;

    // Check if we should retry
    const shouldRetry = 
      config.retryCount < MAX_RETRIES &&
      error.response &&
      (error.response.status === 429 || // Rate limit
       error.response.status >= 500); // Server errors

    if (shouldRetry) {
      config.retryCount += 1;
      
      // Exponential backoff
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, config.retryCount - 1);
      
      logger.warning(`Retrying Open Dental API request (${config.retryCount}/${MAX_RETRIES})`, {
        url: config.url,
        delay,
        status: error.response?.status,
      });

      await new Promise(resolve => setTimeout(resolve, delay));
      
      return openDentalClient(config);
    }

    // Log error details
    logger.error('Open Dental API Error', {
      status: error.response?.status,
      message: error.message,
      url: config.url,
      data: error.response?.data,
    });

    return Promise.reject(error);
  }
);

/**
 * Helper function to handle common HTTP errors
 */
export function handleOpenDentalError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    switch (status) {
      case 400:
        throw new Error(`Bad Request: ${message}`);
      case 401:
        throw new Error('Unauthorized: Invalid API credentials');
      case 403:
        throw new Error('Forbidden: Insufficient permissions');
      case 404:
        throw new Error('Not Found: Resource does not exist');
      case 429:
        throw new Error('Rate Limit Exceeded: Too many requests');
      case 500:
      case 502:
      case 503:
        throw new Error(`Server Error: ${message}`);
      default:
        throw new Error(`Open Dental API Error: ${message}`);
    }
  }
  
  throw error;
}

export default openDentalClient;
