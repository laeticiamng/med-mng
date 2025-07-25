// Chat Completions
export { 
  createChatCompletion,
  type ChatCompletionRequest,
  type ChatCompletionResponse,
  type ChatCompletionMessage,
  type ChatCompletionChoice
} from './chat/completions';

// Image Generation
export {
  generateImage,
  type ImageGenerationRequest,
  type ImageGenerationResponse
} from './images/generations';

// Models
export {
  listModels,
  getModel,
  type Model,
  type ModelsResponse
} from './models/list';

// Client - Use secure API client instead
export { 
  secureOpenAIClient as OpenAIApiClient
} from '../lib/secureApiClient';