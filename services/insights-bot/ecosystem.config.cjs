module.exports = {
  apps: [
    {
      name: 'igor-insights-bot',
      cwd: __dirname,
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '256M',
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
        BOT_PORT: '8787',
        TELEGRAM_USE_POLLING: '1',
      },
    },
  ],
};
