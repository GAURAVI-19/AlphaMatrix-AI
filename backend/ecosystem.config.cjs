module.exports = {
  apps: [
    {
      name: 'alphamatrix-backend',
      script: 'server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      error_file: 'logs/pm2_error.log',
      out_file: 'logs/pm2_out.log',
      log_merge: true,
      time: true
    }
  ]
};
