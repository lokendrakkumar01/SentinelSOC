import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from '../utils/logger';
import { IAlert } from '../models/Alert';
import { ILog } from '../models/Log';

class SocketService {
  private io: Server | null = null;

  init(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: '*', // For development
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  emitAlert(alert: IAlert) {
    if (this.io) {
      this.io.emit('new-alert', alert);
    }
  }

  emitLog(log: ILog) {
    if (this.io) {
      this.io.emit('new-log', log);
    }
  }

  emitIPBlocked(data: { ip: string, reason: string, timestamp: Date }) {
    if (this.io) {
      this.io.emit('ip-blocked', data);
    }
  }

  emitStatsUpdate(stats: any) {
    if (this.io) {
      this.io.emit('stats-update', stats);
    }
  }

  getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.io not initialized');
    }
    return this.io;
  }
}

export const socketService = new SocketService();
