import express from "express";
import morgan from "morgan";
import cors from "cors";
import swaggerUI from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

// database import
import { syncDatabase } from "./models/database";

// middleware imports
import errorHandler from "./middlewares/errorHandler";
import responseWrapper from "./middlewares/responseWrapper";

// routes imports
import { authRouter } from "./routes/authRouter";
import { memeRouter } from "./routes/memeRouter";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(morgan('dev')); // logging middleware
app.use(cors()); // CORS middleware
app.use(express.json()); // JSON parsing middleware
app.use(responseWrapper); // Response wrapper middleware

// OpenAPI specs
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'MemeMuseum REST API',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.ts'],
});

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// routes
// health check route
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: 'MEMEMUSEUM API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// auth route
app.use(authRouter);
app.use(memeRouter);

// error handler middleware
app.use(errorHandler);

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Route not found' });
});

const startServer = async () => {
  try {
    console.log('Connecting to database...');
    await syncDatabase(false);
    console.log('Database connected and synchronized');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`API docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
