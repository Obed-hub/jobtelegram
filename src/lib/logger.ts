import { db, auth } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { AppError } from '@/types/job';

export const logError = async (error: Error | string, additionalData?: any) => {
  try {
    const errorData: AppError = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      userId: auth.currentUser?.uid || 'anonymous',
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...additionalData
    };

    console.error('[AppLogger]', errorData);
    
    // Add to Firestore collection 'errors'
    await addDoc(collection(db, 'errors'), errorData);
  } catch (err) {
    // Fallback if firestore logging fails
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
