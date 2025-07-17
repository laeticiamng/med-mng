import { Request, Response, NextFunction } from 'express';
import { convertToWav } from '../utils/wav';
import { generateVideo } from '../utils/video';
import { removeVocals } from '../utils/vocal-remove';

export async function convertTrackToWav(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const url = await convertToWav(req.params.audioId);
    res.json({ url });
  } catch (err) {
    next(err);
  }
}

export async function generateTrackVideo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const url = await generateVideo(req.params.audioId);
    res.json({ url });
  } catch (err) {
    next(err);
  }
}

export async function removeTrackVocals(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const url = await removeVocals(req.params.audioId);
    res.json({ url });
  } catch (err) {
    next(err);
  }
}
