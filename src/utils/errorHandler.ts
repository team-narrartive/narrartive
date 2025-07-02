
interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export const handleError = (
  error: any,
  context: string,
  options: ErrorHandlerOptions = {}
): string => {
  const {
    showToast = true,
    logError = true,
    fallbackMessage = "An unexpected error occurred. Please try again."
  } = options;

  // Log error for debugging (in development only)
  if (logError && process.env.NODE_ENV === 'development') {
    console.error(`Error in ${context}:`, error);
  }

  // Sanitize error message to prevent information disclosure
  let userMessage = fallbackMessage;
  
  if (error?.message) {
    // Only show specific error messages for known safe errors
    const safeErrors = [
      'Network error',
      'Authentication required',
      'Access denied',
      'Invalid input',
      'Rate limit exceeded',
      'File too large',
      'Invalid file type'
    ];

    const isSafeError = safeErrors.some(safe => 
      error.message.toLowerCase().includes(safe.toLowerCase())
    );

    if (isSafeError) {
      userMessage = error.message;
    }
  }

  return userMessage;
};

export const createSecureErrorBoundary = (context: string) => {
  return (error: Error, errorInfo: any) => {
    // Log the full error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error boundary caught error in ${context}:`, error, errorInfo);
    }

    // Return a generic error message for users
    return "Something went wrong. Please refresh the page and try again.";
  };
};
