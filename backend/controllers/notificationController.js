import { sendOverdueNotifications } from '../services/overdueNotificationService.js';

const triggerOverdueNotifications = async (req, res) => {
  try {
    const summary = await sendOverdueNotifications();

    return res.status(200).json({ success: true, data: summary });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to send overdue notifications'
    });
  }
};

export { triggerOverdueNotifications };
