import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { QuoteRouter } from './routes/quote';
import { HealthRouter } from './routes/health';
import { AdvancedQuoteRouter } from './routes/advancedQuote';
import { SwapRouter } from './routes/swap';
import { logger } from './utils/logger';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging
app.use((req: Request, res: Response, next) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    ip: req.ip
  });
  next();
});

// Routes
app.use('/api/v1', QuoteRouter);
app.use('/api/v1', HealthRouter);
app.use('/api/v1', AdvancedQuoteRouter);
app.use('/api/v1/swap', SwapRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Avalanche DEX Router API',
    version: '1.0.0',
    description: 'DEX aggregator for Avalanche network',
    endpoints: {
      quote: '/api/v1/quote',
      bestRoute: '/api/v1/quote/best',
      advancedQuote: '/api/v1/quote/advanced',
      compareAdvanced: '/api/v1/quote/compare-advanced',
      health: '/api/v1/health',
      dexes: '/api/v1/dexes',
      swapPrepare: '/api/v1/swap/prepare',
      swapTx: '/api/v1/swap/tx/approve | /api/v1/swap/tx/swap',
      approveCheck: '/api/v1/swap/approve-check'
    }
  });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: Function) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Avalanche DEX Router API running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/api/v1/health`);
  logger.info(`💱 Quote endpoint: http://localhost:${PORT}/api/v1/quote`);
});

export default app;