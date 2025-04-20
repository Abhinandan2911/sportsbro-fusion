import { AxiosError } from 'axios';
import { toast } from 'sonner';

/**
 * Error response structure from the API
 */
interface ApiErrorResponse {
  message: string;
  error?: string;
}

/**
 * Handles API errors consistently across the application
 * @param error - The error from an API call
 * @param fallbackMessage - Optional fallback message if error doesn't have a message
 */
export const handleApiError = (error: unknown, fallbackMessage = 'An unexpected error occurred'): string => {
  if (error instanceof AxiosError) {
    // Handle Axios error responses
    const errorData = error.response?.data as ApiErrorResponse | undefined;
    const errorMessage = errorData?.message || errorData?.error || error.message;
    
    // Show a toast message with the error
    toast.error(errorMessage);
    return errorMessage;
  }
  
  // Handle generic errors
  const errorMessage = error instanceof Error ? error.message : fallbackMessage;
  toast.error(errorMessage);
  return errorMessage;
};

/**
 * Shows a success toast message
 * @param message - The success message to display
 */
export const showSuccess = (message: string): void => {
  toast.success(message);
};

export default {
  handleApiError,
  showSuccess
}; 