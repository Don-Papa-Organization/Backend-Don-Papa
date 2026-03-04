import express, { Express, NextFunction, Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { authGatewayMiddleware } from "./middleware/authGatewayMiddleware";

dotenv.config({ path: "./src/.env" });

const app: Express = express();

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:4200",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Evitar que el auth middleware bloquee OPTIONS
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  return authGatewayMiddleware(req, res, next);
});

// Logging global
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(
    `[GATEWAY REQUEST] ${req.method} ${req.path} - Content-Type: ${req.get("content-type")}`
  );
  next();
});

const routes: Record<string, string> = {
  // Productos e Inventario
  "/inventory": process.env.INVENTORY_URL || "http://inventory-service-app:4001/api",
  // Usuarios y Empleados
  "/users": process.env.USERS_AND_EMPLOYERS_URL || "http://user-service-app:4002/api",
  // Pedidos y Pagos
  "/orders": process.env.ORDERS_AND_PAYMENTS_URL_ORDERS || "http://order-service-app:4003/api/orders",
  "/payments": process.env.ORDERS_AND_PAYMENTS_URL_PAYMENTS || "http://order-service-app:4003/api/payments",
  // Reservaciones y Mesas
  "/reservations":
    process.env.RESERVATIONS_AND_TABLES_URL || "http://reservation-service-app:4004/api/reservations",
  "/table": process.env.RESERVATIONS_AND_TABLES_URL || "http://reservation-service-app:4004/api/table",
  // Eventos y Promociones
  "/events": process.env.EVENTS_AND_PROMOTIONS_URL_EVENTS || "http://event-service-app:4005/api/events",
  "/promotions":
    process.env.EVENTS_AND_PROMOTIONS_URL_PROMOTIONS || "http://event-service-app:4005/api/promotions",
  "/eventos-dias":
    process.env.EVENTS_AND_PROMOTIONS_URL_EVENTOS_DIAS || "http://event-service-app:4005/api/eventos-dias",
  "/productos-promocion":
    process.env.EVENTS_AND_PROMOTIONS_URL_PRODUCTOS_PROMOCION ||
    "http://event-service-app:4005/api/productos-promocion",
  "/promocion-evento-dia":
    process.env.EVENTS_AND_PROMOTIONS_URL_PROMOCION_EVENTO_DIA ||
    "http://event-service-app:4005/api/promocion-evento-dia",
  // Reportes y bitácoras
  "/reports": process.env.REPORTS_AND_BINNACLES_URL || "http://report-service-app:4006/api",
  // Agente IA (MS8)
  "/agent": process.env.AGENT_SERVICE_URL || "http://agent-service-app:4008/api",
};

Object.entries(routes).forEach(([path, target]) => {
  app.use(
    path,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      xfwd: true,
      preserveHeaderKeyCase: true,
    })
  );
});

const PORT = process.env.PORT || 4000;

async function startServer() {
  const server = app.listen(PORT, () => {
    console.log("✅ Servidor corriendo en", PORT, "puedes consumir la API Gateway");
  });

  // Aumentar timeouts HTTP
  server.timeout = 60000;
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
}

startServer();