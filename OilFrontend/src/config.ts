import { BASE_URL as ENV_BASE_URL, API_BASE_URL as ENV_API_BASE_URL, GOOGLE_WEB_CLIENT_ID as ENV_GOOGLE_CLIENT_ID } from '@env';

const BASE_URL = ENV_BASE_URL || 'http://localhost:5006';
const API_BASE_URL = ENV_API_BASE_URL || `${BASE_URL}/api`;
const GOOGLE_WEB_CLIENT_ID = ENV_GOOGLE_CLIENT_ID || '';

export const config = {
  BASE_URL,
  API_BASE_URL,
  GOOGLE_WEB_CLIENT_ID,
};

