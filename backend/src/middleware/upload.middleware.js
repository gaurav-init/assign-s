import multer from 'multer';
import { env } from '../config/env.js';
import { Errors } from '../utils/errors.js';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const name = (file.originalname || '').toLowerCase();
  const ok =
    name.endsWith('.csv') ||
    file.mimetype === 'text/csv' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.mimetype === 'text/plain';
  if (!ok) return cb(Errors.invalidFile('Only .csv files are allowed'));
  cb(null, true);
};

export const upload = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: 1 },
  fileFilter,
});
