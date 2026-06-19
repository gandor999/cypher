import { BaseException } from './BaseException';

export class NavigationException extends BaseException {
  constructor(targetUrl: string, originalError: Error | unknown) {
    const errorMessage = originalError instanceof Error ? originalError.message : String(originalError);
    
    super(
      'NavigationException', 
      `Failed to load the website at ${targetUrl}. Reason: ${errorMessage}`, 
      true // Mark as true because network/navigation failures are expected operational errors
    );
  }
}
