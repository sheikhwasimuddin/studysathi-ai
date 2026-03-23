export const config = {
  provider: 'runanywhere' as const,
  strictOffline: (import.meta.env.VITE_STRICT_OFFLINE || 'true') === 'true',
  runAnywhere: {
    apiKey: import.meta.env.VITE_RUNANYWHERE_API_KEY || '',
    baseUrl: import.meta.env.VITE_RUNANYWHERE_BASE_URL || 'https://runanywhere-backend-production.up.railway.app',
  }
};

export const IS_DEV = import.meta.env.DEV;

export const setProvider = (_p: 'runanywhere' | 'nvidia') => {
  config.provider = 'runanywhere';
};
