import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { sendSMSAlert, sendEmailAlert } from './src/lib/notifications';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new SocketIOServer(server, { 
    path: '/socket.io', 
    cors: { origin: '*' } 
  });

  io.on('connection', (socket) => {
    console.log('Socket client connected: ', socket.id);
    
    // User joins their specific room
    socket.on('join_room', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} joined room user:${userId}`);
      socket.emit('alert:status', { message: 'Successfully joined room' });
    });

    socket.on('disconnect', () => {
      console.log('Socket client disconnected: ', socket.id);
    });
  });

  // Polling engine
  setInterval(async () => {
    try {
      // 1. Fetch active alerts
      const alerts = await prisma.priceAlert.findMany({
        where: { isActive: true },
      });

      if (alerts.length === 0) return;

      // Group active alerts by ticker to reduce external API calls
      const tickers = [...new Set(alerts.map((a: { ticker: string }) => a.ticker))];

      for (const ticker of tickers) {
        // Mock IDX API request as requested
        // `const response = await axios.get('https://api.idx.co.id/stocks/' + ticker);`
        
        // MOCK DATA for Phase 2: Randomly fluctuate mock price
        const mockPrice = Math.random() * 1000 + 5000; // Mock price around 5000-6000

        const alertsForTicker = alerts.filter((a: { ticker: string }) => a.ticker === ticker);
        
        for (const alert of alertsForTicker) {
          let triggered = false;
          if (alert.condition === 'above' && mockPrice >= alert.targetPrice) triggered = true;
          if (alert.condition === 'below' && mockPrice <= alert.targetPrice) triggered = true;

          if (triggered) {
            console.log(`[ALERT] Triggered alert for ${alert.userId} on ${ticker}`);
            
            // Mark as triggered in DB
            await prisma.priceAlert.update({
              where: { id: alert.id },
              data: { isActive: false, triggeredAt: new Date() }
            });
            // Emit via socket
            io.to(`user:${alert.userId}`).emit('alert:triggered', { 
              stock: ticker, 
              message: `Target ${alert.condition} ${alert.targetPrice} hit! Current: ${mockPrice.toFixed(0)}`,
              price: mockPrice
            });

            // Dispatch to Notification Channels (Phase 3)
            // Fetch user plan and preferences
            const user = await prisma.user.findUnique({ where: { id: alert.userId } });
            if (user && user.plan === 'premium') {
              if (alert.notifySms) {
                // Assuming we have user.phone, we use a mock for now
                sendSMSAlert('+1234567890', `Stockscope Alert: ${ticker} hit ${mockPrice.toFixed(2)}`);
              }
              if (alert.notifyEmail) {
                sendEmailAlert(user.email, `Stockscope Alert: ${ticker}`, `<p>${ticker} recently crossed your target!</p>`);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('IDX API Polling error:', error);
    }
  }, 15000);

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err?: any) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
