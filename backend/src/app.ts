import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUI from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

// database import
import { syncDatabase } from "./models/database";

// middleware imports
import errorHandler from "./middlewares/errorHandler";
import responseWrapper from "./middlewares/responseWrapper";

// routes imports
import apiRouter from "./routes/api.router";

const app = express();
const PORT = process.env.PORT ?? 3000;
const corsOptions = {
  origin: "http://localhost:4200", // Angular client URL
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cookieParser()); // Cookie parsing middleware
app.use(morgan("dev")); // logging middleware
app.use(cors(corsOptions)); // CORS middleware
app.use(express.json()); // JSON parsing middleware
app.use(responseWrapper); // Response wrapper middleware

// OpenAPI specs
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.1.0",
    info: {
      title: "MemeMuseum REST API",
      version: "1.0.0",
    },
  },
  apis: ["./src/routes/*.ts"],
});

app.use("/api/v1/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// routes
app.use(apiRouter);

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ message: "Route not found" });
});

// error handler middleware
app.use(errorHandler);

const startServer = async () => {
  try {
    console.log("Connecting to database...");
    await syncDatabase(false);
    console.log("Database connected and synchronized");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Status check: http://localhost:${PORT}/api/v1/status`);
      console.log(`API docs: http://localhost:${PORT}/api/v1/docs`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
