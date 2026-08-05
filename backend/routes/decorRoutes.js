import express from 'express';
import {
  getDecorations,
  getDecorationById,
  createDecoration,
  updateDecoration,
  deleteDecoration,
} from '../controllers/decorController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/seed-db', (req, res) => {
  const { secret } = req.query;
  if (secret !== 'vijayhappymoments2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const seederPath = path.join(__dirname, '../seeder.js');
  exec(`node "${seederPath}"`, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message, stderr });
    }
    res.json({ success: true, message: 'Database seeded successfully', stdout });
  });
});

router.route('/')
  .get(getDecorations)
  .post(protect, admin, createDecoration);

router.route('/:id')
  .get(getDecorationById)
  .put(protect, admin, updateDecoration)
  .delete(protect, admin, deleteDecoration);

export default router;
