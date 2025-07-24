import request from 'supertest';
import express from 'express';
import { errorHandler } from '../src/middleware/errorHandler';
import { notifyIncident } from '../src/services/alertService';

jest.mock('../src/services/alertService', () => ({ notifyIncident: jest.fn() }));

const app = express();
app.get('/boom', () => {
  throw new Error('boom');
});
app.use(errorHandler);

describe('errorHandler', () => {
  it('calls notifyIncident on error', async () => {
    await request(app).get('/boom');
    expect(notifyIncident).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'BACKEND_ERROR' })
    );
  });
});
