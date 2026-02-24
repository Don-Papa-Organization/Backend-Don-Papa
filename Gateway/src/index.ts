  import express, { Express, Request, Response, NextFunction} from "express";
  import { createProxyMiddleware } from "http-proxy-middleware";
  import dotenv from 'dotenv';
  import cookieParser from 'cookie-parser';
  import { authGatewayMiddleware } from './middleware/authGatewayMiddleware';
  import cors from 'cors';

  dotenv.config({ path: './src/.env' });

  const app: Express = express();

  // Middleware para parsear cookies (necesario para el auth middleware)
  app.use(cookieParser());


  // CORS primero
	app.use(cors({
	  origin: process.env.CORS_ORIGIN || "http://localhost:4200",
	  credentials: true,
	  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
	  allowedHeaders: ["Content-Type","Authorization"]
	}));


  // Preflight sin auth (manejo global en middleware para evitar path-to-regexp)

  // Evitar que el auth middleware bloquee OPTIONS
  app.use((req, res, next) => {
	  if (req.method === "OPTIONS") return res.sendStatus(204);
	  return authGatewayMiddleware(req, res, next);
	});

  // NO usar ningún middleware de body parsing global
  // El proxy middleware de http-proxy-middleware va a manejar el stream directamente
  // Solo logging, sin consumir el body

  // Middleware global para loggear todas las peticiones
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[GATEWAY REQUEST] ${req.method} ${req.path} - Content-Type: ${req.get('content-type')}`);
    next();
  });

  // Aplicar middleware de autenticación ANTES de los proxies
  // Este middleware solo ayuda a refrescar tokens automáticamente
  // No bloquea rutas - cada microservicio gestiona su propia autenticación
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    return authGatewayMiddleware(req, res, next);
  });

  const routes = {
      // Productos e Inventario (exponer todas las rutas del ms1)
      "/inventory": process.env.INVENTORY_URL || "http://inventory-service-app:4001/api/",
      // Usuarios y Empleados (exponer todas las rutas del ms2)
      "/users": process.env.USERS_AND_EMPLOYERS_URL || "http://user-service-app:4002/api",
      // Pedidos y Pagos (exponer todas las rutas del ms3)
      "/orders": process.env.ORDERS_AND_PAYMENTS_URL_ORDERS || "http://order-service-app:4003/api/orders",
      "/payments": process.env.ORDERS_AND_PAYMENTS_URL_PAYMENTS || "http://order-service-app:4003/api/payments",
      // Reservaciones y Mesas 
      "/reservations": process.env.RESERVATIONS_AND_TABLES_URL || "http://reservation-service-app:4004/api/reservations",
      "/table": process.env.RESERVATIONS_AND_TABLES_URL || "http://reservation-service-app:4004/api/table",
      // Eventos y Promociones (exponer todas las rutas del ms5)
      "/events": process.env.EVENTS_AND_PROMOTIONS_URL_EVENTS || "http://event-service-app:4005/api/events",
      "/promotions": process.env.EVENTS_AND_PROMOTIONS_URL_PROMOTIONS || "http://event-service-app:4005/api/promotions",
      "/eventos-dias": process.env.EVENTS_AND_PROMOTIONS_URL_EVENTOS_DIAS || "http://event-service-app:4005/api/eventos-dias",
      "/productos-promocion": process.env.EVENTS_AND_PROMOTIONS_URL_PRODUCTOS_PROMOCION || "http://event-service-app:4005/api/productos-promocion",
      //reportes y bitacoras
      "/reports": process.env.REPORTS_AND_BINNACLES_URL || "http://report-service-app:4006/api",
    }

  Object.entries(routes).forEach(([path, target]) => {
    console.log(path, target) 
    app.use(
      path,
      createProxyMiddleware({
        target, 
        changeOrigin: true,
        pathRewrite: (pathReq) => {
          // Eliminar el prefijo del path (ej: /users -> /api)
          const newPath = pathReq.replace(path, '');
          console.log(`[PROXY REWRITE] ${pathReq} -> ${newPath}`);
          return newPath;
        },
        logger: console, 
        timeout: 60000, // 60 segundos
        proxyTimeout: 60000, // 60 segundos
        ws: false, // No soportar WebSocket por ahora
        preserveHeaderKeyCase: true
      })
    );
  });


  const PORT = process.env.PORT || 4000;

  async function startServer() {
      const server = app.listen(PORT, () => {
        console.log("✅ Servidor corriendo en", PORT, "puedes consumir la API Gateway");
      });
      
      // Aumentar los timeouts del servidor HTTP
      server.timeout = 60000; // 60 segundos
      server.keepAliveTimeout = 65000; // 65 segundos
      server.headersTimeout = 66000; // 66 segundos
    }
    
  startServer()