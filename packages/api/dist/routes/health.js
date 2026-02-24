"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthRouter = void 0;
const express_1 = require("express");
exports.HealthRouter = (0, express_1.Router)();
/**
 * @route GET /api/v1/health
 * @description Health check endpoint
 */
exports.HealthRouter.get('/health', (req, res) => {
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
exports.HealthRouter.get('/ready', async (req, res) => {
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
    }
    catch (error) {
        res.status(503).json({
            ready: false,
            error: 'Service not ready'
        });
    }
});
async function checkRpcConnection() {
    try {
        const { ethers } = require('ethers');
        const provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc');
        const blockNumber = await provider.getBlockNumber();
        return blockNumber > 0;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=health.js.map