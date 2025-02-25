import dotenv from 'dotenv';

dotenv.config();

const env = {
  RTC_SIMULATION_API_PORT: parseInt(process.env.RTC_SIMULATION_API_PORT || '3000', 10),
  RTC_SIMULATION_ROOT_PATH: process.env.RTC_SIMULATION_ROOT_PATH || 'http://localhost:3000/api',
  RTC_SIMULATION_DURATION_MIN: parseInt(process.env.RTC_SIMULATION_DURATION_MIN || '5', 10) * 60 * 1000,
};

export default env;
