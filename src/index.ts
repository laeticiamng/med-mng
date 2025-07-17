import express from 'express';
import { healthCheck } from './controllers/healthController';
import {
  convertTrackToWav,
  generateTrackVideo,
  removeTrackVocals,
} from './controllers/sunoController';
import { getEdnMusic } from './controllers/ednController';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', healthCheck);

app.get('/suno/:audioId/wav', convertTrackToWav);
app.post('/suno/:audioId/video', generateTrackVideo);
app.post('/suno/:audioId/instrumental', removeTrackVocals);

app.get('/edn/:slug/music/:rang', getEdnMusic);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
