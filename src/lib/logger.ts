import { db, auth } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { AppError } from '@/types/job';

const sanitizeData = (data: any): any => {
  if (data === undefined) return null;
  if (data === null) return null;
  
  if (typeof data !== 'object') return data;

  // Handle common error objects that aren't plain objects
  if (data instanceof Error || (typeof DOMException !== 'undefined' && data instanceof DOMException)) {
    return {
      message: data.message,
      name: data.name,
      stack: (data as any).stack || null,
      ...(data instanceof DOMException ? { code: (data as any).code } : {})
    };
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  // Handle plain objects
  const sanitized: any = {};
  try {
    for (const [key, value] of Object.entries(data)) {
      const sanitizedValue = sanitizeData(value);
      if (sanitizedValue !== undefined) {
        sanitized[key] = sanitizedValue;
      }
    }
  } catch (e) {
    // If it's something we can't iterate over (like a weird host object), just stringify it
    return String(data);
  }
  
  return sanitized;
};

export const logError = async (error: Error | string, additionalData?: any) => {
  try {
    // Don't log aborted requests to Firestore as they are usually noise
    const isAbortError = error instanceof Error && error.name === 'AbortError';
    const isDOMAbort = typeof error === 'object' && (error as any)?.name === 'AbortError';
    
    const errorData = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? (error as any).stack : null,
      timestamp: new Date().toISOString(),
      userId: auth.currentUser?.uid || 'anonymous',
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...additionalData
    };

    const sanitizedData = sanitizeData(errorData);

    console.error('[AppLogger]', sanitizedData);
    
    // Only log to Firestore if not an AbortError or specifically requested
    if (!isAbortError && !isDOMAbort) {
      await addDoc(collection(db, 'errors'), sanitizedData);
    }
  } catch (err) {
    console.error('[AppLogger] Failed to log error to Firestore:', err);
  }
};

// Global error handlers
export const initGlobalErrorHandling = () => {
  window.onerror = (message, source, lineno, colno, error) => {
    logError(error || (message as string), { source, lineno, colno });
  };

  window.onunhandledrejection = (event) => {
    logError(event.reason instanceof Error ? event.reason : 'Unhandled Promise Rejection', {
      reason: event.reason
    });
  };
};
