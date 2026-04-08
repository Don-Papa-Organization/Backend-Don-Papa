import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

const AUTH_SERVICE_URL = process.env.USERS_AND_EMPLOYERS_URL || 'http://user-service-app:4002/api';

/**
 * Middleware del Gateway para refrescar tokens automáticamente
 * Si el access token expiró pero hay refresh token, obtiene nuevos tokens
 */
export async function authGatewayMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Extraer tokens de cookies
    const cookieHeader = req.headers.cookie;
    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    if (cookieHeader) {
      const accessMatch = cookieHeader.match(/accessToken=([^;]+)/);
      const refreshMatch = cookieHeader.match(/refreshToken=([^;]+)/);
      
      if (accessMatch?.[1]) {
        accessToken = accessMatch[1];
      }
      if (refreshMatch?.[1]) {
        refreshToken = refreshMatch[1];
      }
    }

    // También verificar headers Authorization (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      accessToken = authHeader.replace('Bearer ', '').trim();
    }

    // Refrescar solo cuando falta access token y existe refresh token.
    // Refrescar en cada request genera tormenta de tokens y duplicados en DB.
    if (!accessToken && refreshToken) {
      console.log('[GATEWAY] Refresh token disponible, intentando refrescar...');
      
      try {
        // Llamar al endpoint de refresh del MS2
        const refreshResponse = await axios.post(
          `${AUTH_SERVICE_URL}/auth/refresh-token`,
          {},
          {
            headers: {
              'Cookie': `refreshToken=${refreshToken}`
            },
            timeout: 5000 // Timeout de 5 segundos
          }
        );

        // MS2 devuelve las cookies en Set-Cookie
        const setCookieHeader = refreshResponse.headers['set-cookie'];
        
        if (setCookieHeader) {
          // Propagar las cookies al cliente
          res.setHeader('Set-Cookie', setCookieHeader);
          
          // Extraer el nuevo accessToken para usarlo en esta petición
          const newAccessMatch = setCookieHeader.find((c: string) => c.startsWith('accessToken='));
          if (newAccessMatch) {
            const newAccessToken = newAccessMatch.split(';')[0].split('=')[1];
            
            // Actualizar el header Authorization y Cookie para la petición actual
            req.headers.authorization = `Bearer ${newAccessToken}`;
            req.headers.cookie = `accessToken=${newAccessToken}; ${req.headers.cookie || ''}`;
          }
        }

        console.log('[GATEWAY] Tokens refrescados exitosamente');
        return next();
        
      } catch (refreshError: any) {
        const errorMessage = refreshError.response?.data?.message || refreshError.message;
        const statusCode = refreshError.response?.status || 'sin código';
        console.error(`[GATEWAY] Error al refrescar token (${statusCode}):`, errorMessage);
        // Si el refresh falla, continuar sin token
        // El microservicio decidirá si rechaza la petición
        console.log('[GATEWAY] Continuando sin token, el microservicio validará la autenticación');
        return next();
      }
    }

    // Si no hay refresh token, simplemente continuar
    // Los microservicios se encargarán de validar la autenticación
    return next();
    

  } catch (error: any) {
    console.error('[GATEWAY] Error en authGatewayMiddleware:', error.message);
    return res.status(500).json({
      message: 'Error interno del gateway'
    });
  }
}

/**
 * Middleware para rutas que requieren autenticación
 * Aplica el refresh automático de tokens
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  return authGatewayMiddleware(req, res, next);
}
