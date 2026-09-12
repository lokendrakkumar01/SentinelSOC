import nodemailer from 'nodemailer';
import { IAlert } from '../models/Alert';
import { config } from '../config/env';
import { logger } from '../utils/logger';

class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });
  }

  async sendSlackNotification(alert: IAlert) {
    if (!config.SLACK_WEBHOOK_URL) return;

    const color = alert.severity === 'CRITICAL' ? '#FF0000' : '#FFA500';
    
    const payload = {
      attachments: [
        {
          color,
          title: `[${alert.severity}] ${alert.title}`,
          text: alert.description,
          fields: [
            { title: 'Type', value: alert.type, short: true },
            { title: 'Source IP', value: alert.sourceIP || 'N/A', short: true },
            { title: 'User', value: alert.username || 'N/A', short: true },
            { title: 'MITRE Technique', value: alert.mitreAttack?.techniqueName || 'N/A', short: true }
          ]
        }
      ]
    };

    try {
      await fetch(config.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      logger.error('Failed to send Slack notification:', err);
    }
  }

  async sendEmailNotification(alert: IAlert) {
    if (!config.SMTP_USER || !config.SMTP_PASS) return;

    try {
      await this.transporter.sendMail({
        from: '"SentinelSOC" <soc@example.com>',
        to: 'admin@example.com',
        subject: `[${alert.severity}] Alert: ${alert.title}`,
        html: `
          <h2>${alert.title}</h2>
          <p><strong>Severity:</strong> ${alert.severity}</p>
          <p><strong>Description:</strong> ${alert.description}</p>
          <p><strong>Source IP:</strong> ${alert.sourceIP}</p>
          <p><strong>Username:</strong> ${alert.username}</p>
        `
      });
    } catch (err) {
      logger.error('Failed to send email notification:', err);
    }
  }

  async notify(alert: IAlert) {
    if (alert.severity === 'HIGH' || alert.severity === 'CRITICAL') {
      await this.sendEmailNotification(alert);
    }
    
    if (alert.severity === 'CRITICAL') {
      await this.sendSlackNotification(alert);
    }
  }
}

export const notificationService = new NotificationService();
