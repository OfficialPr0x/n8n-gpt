import { Request, Response } from 'express';
import os from 'os';
import { version } from '../../package.json';

/**
 * Health check endpoint controller
 * Provides system status information for monitoring and diagnostics
 */
export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    const uptime = process.uptime();
    const formattedUptime = formatUptime(uptime);
    
    const healthData = {
      status: 'operational',
      timestamp: new Date().toISOString(),
      version,
      environment: process.env.NODE_ENV || 'development',
      server: {
        uptime: formattedUptime,
        memory: {
          total: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
          free: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
          usage: `${Math.round((1 - os.freemem() / os.totalmem()) * 100)}%`
        },
        cpu: {
          cores: os.cpus().length,
          model: os.cpus()[0].model,
          load: os.loadavg()
        }
      }
    };

    res.status(200).json(healthData);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve health information',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Formats uptime in a human-readable format
 * @param uptime - Server uptime in seconds
 * @returns Formatted uptime string
 */
function formatUptime(uptime: number): string {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
}
