import { Router, Request, Response } from 'express';

export const HealthRouter = Router();

/**
 * @route GET /api/v1/health
 * @description Health check endpoint
 */
HealthRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

/**
 * @route GET /api/v1/ready
 * @description Readiness check (verifies connections)
 */
HealthRouter.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check RPC connectivity
    const rpcHealthy = await checkRpcConnection();
    
    res.json({
      ready: rpcHealthy,
      checks: {
        rpc: rpcHealthy ? 'ok' : 'error'
      },
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      error: 'Service not ready'
    });
  }
});

async function checkRpcConnection(): Promise<boolean> {
  try {
    const { ethers } = require('ethers');
    const provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc');
    const blockNumber = await provider.getBlockNumber();
    return blockNumber > 0;
  } catch {
    return false;
  }
}