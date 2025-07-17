import { convertToWav } from '../src/utils/wav';
import { generateVideo } from '../src/utils/video';
import { removeVocals } from '../src/utils/vocal-remove';
import { SunoApiClient } from '../src/lib/sunoClient';

jest.mock('../src/lib/sunoClient');

const mockInstance = {
  get: jest.fn(),
  post: jest.fn(),
};
(SunoApiClient as jest.Mock).mockImplementation(() => mockInstance);

afterEach(() => {
  jest.clearAllMocks();
});

test('convertToWav calls correct endpoint', async () => {
  mockInstance.get.mockResolvedValue({ downloadUrl: 'url.wav' });
  const url = await convertToWav('abc');
  expect(mockInstance.get).toHaveBeenCalledWith('/api/v1/audio/abc/wav');
  expect(url).toBe('url.wav');
});

test('generateVideo calls correct endpoint', async () => {
  mockInstance.post.mockResolvedValue({ videoUrl: 'video.mp4' });
  const url = await generateVideo('123');
  expect(mockInstance.post).toHaveBeenCalledWith('/api/v1/video', {
    audioId: '123',
  });
  expect(url).toBe('video.mp4');
});

test('removeVocals calls correct endpoint', async () => {
  mockInstance.post.mockResolvedValue({ audioUrl: 'no-vocals.mp3' });
  const url = await removeVocals('xyz');
  expect(mockInstance.post).toHaveBeenCalledWith(
    '/api/v1/audio/xyz/remove-vocals',
    {}
  );
  expect(url).toBe('no-vocals.mp3');
});
