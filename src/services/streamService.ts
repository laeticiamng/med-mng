export class StreamUrlNotFoundError extends Error {
  constructor() {
    super('Stream URL not found');
    this.name = 'StreamUrlNotFoundError';
  }
}

export const getSecureStreamUrl = async (trackId: string): Promise<string> => {
  const response = await fetch(`/api/stream/${trackId}`);
  if (!response.ok) {
    throw new StreamUrlNotFoundError();
  }
  const data = await response.json();
  if (!data?.url) {
    throw new StreamUrlNotFoundError();
  }
  return data.url;
};
