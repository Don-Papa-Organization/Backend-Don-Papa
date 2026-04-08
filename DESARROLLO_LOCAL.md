# 🚀 Don Papa Backend - Instrucciones de Ejecución Local

## Cambios Realizados

### 1. **Se arregló la ruta del agent-service Dockerfile**
   - Antes: `./ms8-agent-service/agente`
   - Ahora: `./ms8-agent-service/agente/agente`
   - **Archivo modificado:** `docker-compose.yml`

### 2. **Se removió dependencia circular del gateway**
   - El gateway ya no depende explícitamente de todos los servicios
   - Esto permitía que los servicios se levantaran de forma independiente
   - **Archivo modificado:** `docker-compose.yml`

### 3. **Se creó `docker-compose.local.yml` para desarrollo en Windows**
   - Versión sin port mappings externos (sin `-p "4001:4001"`)
   - Todos los servicios se comunican en red interna Docker
   - **Archivo nuevo:** `docker-compose.local.yml`

## ✅ Servicios Configurados y Funcionando

| Servicio | Puerto Interno | Estado |
|----------|---|---|
| Gateway | 4000 | ✅ UP |
| Inventory Service | 4001 | ✅ UP |
| User Service (Java) | 4002 | ✅ UP |
| Order Service | 4003 | ✅ UP |
| Reservation Service | 4004 | ✅ UP |
| Event Service | 4005 | ✅ UP |
| Report Service | 4006 | ✅ UP |
| Email Service | 4007 | ✅ UP |
| Agent Service (Python) | 4008 | ✅ UP |
| **6x MySQL Databases** | 3306 | ✅ UP |

**Total: 15 servicios corriendo correctamente**

## 🏃 Cómo Ejecutar en Local

### Opción A: Windows (Recomendado)
```bash
# Usar la versión sin port bindings externos
docker compose -f docker-compose.local.yml up -d

# Ver estado de servicios
docker compose -f docker-compose.local.yml ps

# Ver logs
docker compose -f docker-compose.local.yml logs -f gateway

# Detener todos
docker compose -f docker-compose.local.yml down
```

### Opción B: Azure VM (Para desarrollo remoto con ports expuestos)
```bash
# En la VM en Azure, usar:
ssh Jacobing07@40.67.242.108
cd /home/Jacobing07
cp .env.vm .env
docker compose up -d

# Los servicios estarán disponibles en los puertos específicos
```

## 🔧 Variables de Entorno

Todos los secretos están pre-configurados con valores fallback en ambos archivos:

```env
DB_PASSWORD=MiContraseñaSegura123!
JWT_SECRET=tu_super_secreto_jwt_development_very_secure_key_12345
JWT_REFRESH_SECRET=tu_super_secreto_jwt_development_very_secure_key_12345
GOOGLE_API_KEY=AIzaSyAlUqoUfHWhjqa3JQgsCqJjxn-PFtvm3Qs
INTERNAL_SERVICE_TOKEN=una_llave_secreta_compartida
```

**No es necesario crear un archivo `.env` para desarrollo local.**

## ⚠️ Limitaciones en Windows (Docker Desktop)

- **Port Mapping**: En Windows, Docker Desktop a veces tiene problemas con los port bindings específicos
- **Solución**: El archivo `docker-compose.local.yml` no mapea puertos externos, los servicios solo se comunican internamente
- Para acceder desde fuera de los contenedores, usa `docker compose -f docker-compose.local.yml exec {servicio} curl ...`

## ✔️ Verificación de Funcionamiento

```bash
# Ver todos los servicios UP
docker compose -f docker-compose.local.yml ps

# Ejecutar comando dentro del gateway
docker compose -f docker-compose.local.yml exec gateway curl http://inventory-service-app:4001/health

# Ver logs del inventory service
docker compose -f docker-compose.local.yml logs inventory-service-app --tail=30
```

## 📝 Diferencias entre docker-compose.yml y docker-compose.local.yml

| Aspecto | docker-compose.yml | docker-compose.local.yml |
|---------|---|---|
| Port Mappings | ✅ Sí (4000-4008) | ❌ No |
| Uso | Producción / Azure VM | Desarrollo Local Windows |
| Dependencias circulares | ❌ Removidas en gateway | ❌ Removidas |
| Secretos | ✅ Con fallbacks | ✅ Con fallbacks |

## 🐛 Si hay problemas

1. **Puertos bloqueados en Windows**: Usa `docker-compose.local.yml`
2. **MySQL unhealthy**: Espera 2-3 minutos, los healthchecks pueden tardar
3. **Servicios no inician**: Revisa logs con `docker-compose logs -f {servicio}`
4. **Para Azure**: Usa el archivo original `docker-compose.yml` y SSH en la VM

## 🎯 Próximos Pasos

- [ ] Actualizar `.env.example` con los nuevos valores fallback
- [ ] Crear Makefile con alias útiles (make up, make down, make logs)
- [ ] Configurar health checks en el gateway para forzar que espere a los otros servicios
