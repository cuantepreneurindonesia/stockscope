import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { sendSMSAlert, sendEmailAlert } from './src/lib/notifications';
import express from 'express';
import compression from 'compression';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import Stripe from 'stripe';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

app.prepare().then(() => {
  const expressApp = express();

  // Phase 2: Gzip compression for all API responses
  expressApp.use(compression());

  // Phase 3: Stripe Webhook Flow (Must bypass JSON body-parser)
  if (dev === false) {
    // In production, fail fast if required Stripe env vars are missing
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET must be set in production');
    }
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_dev', {
    apiVersion: '2022-11-15' as any,
  });

  expressApp.post(
    '/api/webhook/stripe',
    express.raw({ type: 'application/json' }),
    async (req: express.Request, res: express.Response) => {
      const sig = req.headers['stripe-signature'];
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig as string,
          process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock_key_for_dev'
        );
      } catch (err: any) {
        console.error(`Webhook signature verification failed:`, err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      if (event.type === 'checkout.session.completed') {
        const session: any = event.data.object;
        if (session.client_reference_id) {
          try {
            await prisma.user.update({
              where: { id: session.client_reference_id },
              data: { plan: 'premium' },
            });
            console.log(`Successfully upgraded user ${session.client_reference_id} to Premium`);
          } catch (dbErr) {
            console.error('Database update failed:', dbErr);
          }
        }
      }
      res.json({ received: true });
    }
  );

  // Swagger Setup (Phase 2)
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: { title: 'Stockscope API', version: '1.0.0', description: 'API Documentation for Stockscope' },
      servers: [{ url: '/api', description: 'Next.js App Router API endpoints' }],
    },
    apis: ['./app/api/**/*.ts', './server.ts'],
  };
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  expressApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  expressApp.all('*', (req: express.Request, res: express.Response) => {
    try {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.status(500).send('internal server error');
    }
  });

  const server = createServer(expressApp);

  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(',')
    : dev
    ? ['http://localhost:3000']
    : [];

  const io = new SocketIOServer(server, { 
    path: '/socket.io', 
    cors: { origin: allowedOrigins, credentials: true } 
  });

  io.on('connection', (socket) => {
    console.log('Socket client connected: ', socket.id);
    
    // User joins their specific room — requires a non-empty userId.
    // Full NextAuth JWT token verification should be added before production use.
    socket.on('join_room', (data: { userId: string }) => {
      const userId = typeof data === 'object' && data !== null ? data.userId : undefined;
      if (!userId || typeof userId !== 'string') {
        socket.emit('alert:error', { message: 'Unauthorized: userId required to join room' });
        return;
      }
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
