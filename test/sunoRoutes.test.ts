import request from 'supertest';
import express from 'express';
import {
  convertTrackToWav,
  generateTrackVideo,
  removeTrackVocals,
} from '../src/controllers/sunoController';
import { errorHandler } from '../src/middleware/errorHandler';
import { convertToWav } from '../src/utils/wav';
import { generateVideo } from '../src/utils/video';
import { removeVocals } from '../src/utils/vocal-remove';

jest.mock('../src/utils/wav');
jest.mock('../src/utils/video');
jest.mock('../src/utils/vocal-remove');

const app = express();
app.use(express.json());
app.get('/suno/:audioId/wav', convertTrackToWav);
app.post('/suno/:audioId/video', generateTrackVideo);
app.post('/suno/:audioId/instrumental', removeTrackVocals);
app.use(errorHandler);

test('GET /suno/:id/wav uses convertToWav', async () => {
  (convertToWav as jest.Mock).mockResolvedValue('a.wav');
  const res = await request(app).get('/suno/1/wav');
  expect(convertToWav).toHaveBeenCalledWith('1');
  expect(res.status).toBe(200);
  expect(res.body.url).toBe('a.wav');
});

test('POST /suno/:id/video uses generateVideo', async () => {
  (generateVideo as jest.Mock).mockResolvedValue('v.mp4');
  const res = await request(app).post('/suno/2/video');
  expect(generateVideo).toHaveBeenCalledWith('2');
  expect(res.status).toBe(200);
  expect(res.body.url).toBe('v.mp4');
});

test('POST /suno/:id/instrumental uses removeVocals', async () => {
  (removeVocals as jest.Mock).mockResolvedValue('nv.mp3');
  const res = await request(app).post('/suno/3/instrumental');
  expect(removeVocals).toHaveBeenCalledWith('3');
  expect(res.status).toBe(200);
  expect(res.body.url).toBe('nv.mp3');
});
