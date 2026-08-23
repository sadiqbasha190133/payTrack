import { getDashboardData } from '../services/dashboardService.js';

const getDashboard = async (req, res) => {
  try {
    const dashboardData = await getDashboardData();
    return res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load dashboard data' });
  }
};

export { getDashboard };
