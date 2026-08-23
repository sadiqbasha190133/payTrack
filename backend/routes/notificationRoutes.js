import express from 'express';
import { triggerOverdueNotifications } from '../controllers/notificationController.js';

const router = express.Router();

router.post('/overdue', triggerOverdueNotifications);

export default router;
