"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const quote_1 = require("./routes/quote");
const health_1 = require("./routes/health");
const advancedQuote_1 = require("./routes/advancedQuote");
const swap_1 = require("./routes/swap");
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Request logging
app.use((req, res, next) => {
    logger_1.logger.info(`${req.method} ${req.path}`, {
        query: req.query,
        ip: req.ip
    });
    next();
});
// Routes
app.use('/api/v1', quote_1.QuoteRouter);
app.use('/api/v1', health_1.HealthRouter);
app.use('/api/v1', advancedQuote_1.AdvancedQuoteRouter);
app.use('/api/v1/swap', swap_1.SwapRouter);
// Root endpoint
app.get('/', (req, res) => {
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
app.use((err, req, res, next) => {
    logger_1.logger.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Start server
app.listen(PORT, () => {
    logger_1.logger.info(`🚀 Avalanche DEX Router API running on port ${PORT}`);
    logger_1.logger.info(`📊 Health check: http://localhost:${PORT}/api/v1/health`);
    logger_1.logger.info(`💱 Quote endpoint: http://localhost:${PORT}/api/v1/quote`);
});
exports.default = app;
//# sourceMappingURL=index.js.map