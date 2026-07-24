const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GoldenPrime API',
      version: '1.0.0',
      description: 'GoldenPrime Crypto Investment Platform API. Features: Auth, Wallet, Crypto Trading, P2P Marketplace, GPG Preorders, Referrals, KYC, Admin.',
      contact: { name: 'GoldenPrime', url: 'https://goldenprime.com' },
      license: { name: 'Proprietary' },
    },
    servers: [
      { url: 'http://localhost:5001/api', description: 'Local development' },
      { url: 'https://goldenprime-api.vercel.app/api', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            is_verified: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Wallet: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            currency: { type: 'string' },
            balance: { type: 'number' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['deposit', 'withdrawal', 'buy', 'sell', 'referral_reward', 'escrow_lock', 'escrow_release', 'crypto_received'] },
            currency: { type: 'string' },
            amount: { type: 'number' },
            usd_value: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'completed', 'rejected'] },
          },
        },
        P2POrder: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['buy', 'sell'] },
            coin: { type: 'string' },
            amount: { type: 'number' },
            price_per_unit: { type: 'number' },
            total_usd: { type: 'number' },
            payment_method: { type: 'string' },
            status: { type: 'string', enum: ['open', 'filled', 'cancelled'] },
          },
        },
        Trade: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            order_id: { type: 'string', format: 'uuid' },
            buyer_id: { type: 'string', format: 'uuid' },
            seller_id: { type: 'string', format: 'uuid' },
            coin: { type: 'string' },
            amount: { type: 'number' },
            price_per_unit: { type: 'number' },
            total_usd: { type: 'number' },
            status: { type: 'string', enum: ['escrow', 'completed', 'disputed'] },
            buyer_confirmed: { type: 'boolean' },
            seller_confirmed: { type: 'boolean' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./backend/src/routes/*.js', './src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'GoldenPrime API Docs',
  }));
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

module.exports = { setupSwagger, swaggerSpec };
