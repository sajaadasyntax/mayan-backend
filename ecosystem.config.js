module.exports = {
  apps: [
    {
      name: 'mayan-backend',
      script: 'dist/index.js',
      instances: 4, // Use all 4 vCPUs for maximum performance
      exec_mode: 'cluster', // Cluster mode for load balancing across all cores
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      // Logging configuration
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Auto-restart configuration
      autorestart: true,
      watch: false, // Disable watch in production
      max_memory_restart: '800M', // Restart if memory exceeds 800MB per instance (total ~3.2GB for 4 instances)
      // Advanced PM2 features
      min_uptime: '10s', // Minimum uptime before considering app stable
      max_restarts: 10, // Maximum restarts in 1 minute
      restart_delay: 4000, // Delay between restarts (ms)
      // Kill timeout for graceful shutdown
      kill_timeout: 5000,
      // Wait for listen event before considering app online
      wait_ready: true,
      listen_timeout: 10000,
      // Instance vars (for load balancing)
      instance_var: 'INSTANCE_ID',
      // Cron restart (optional - restart daily at 3 AM)
      // cron_restart: '0 3 * * *',
    }
  ]
}

