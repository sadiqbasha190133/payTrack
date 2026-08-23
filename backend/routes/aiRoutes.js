import express from 'express';
import { generateReminder, generateInsights, chat } from '../controllers/aiController.js';

const router = express.Router();

router.post('/reminder', generateReminder);
router.post('/insights', generateInsights);
router.post('/chat', chat);

export default router;
