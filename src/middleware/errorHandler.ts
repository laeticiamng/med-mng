import { createEnhancedErrorHandler } from './enhancedErrorHandler';

export const errorHandler = createEnhancedErrorHandler({
  maskSensitiveData: true,
});
