// DEPRECATED: These clients are insecure and should not be used
// Use secureApiClient.ts instead for all API operations

console.warn('⚠️ SECURITY WARNING: Direct API clients are deprecated for security reasons. Use secureApiClient.ts instead.');

// Mark the old clients as deprecated
export const OpenAIApiClient = class {
  constructor() {
    throw new Error('DEPRECATED: OpenAIApiClient is insecure. Use secureOpenAIClient from secureApiClient.ts instead.');
  }
};

export const SunoApiClient = class {
  constructor() {
    throw new Error('DEPRECATED: SunoApiClient is insecure. Use secureSunoClient from secureApiClient.ts instead.');
  }
};

export const OpenAIRequestError = Error;
export const SunoRequestError = Error;