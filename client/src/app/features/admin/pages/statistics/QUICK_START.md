# Quick Start - Módulo de Estadísticas

## 🚀 Inicio Rápido en 5 pasos

### 1. Acceder al Módulo
```
URL: http://localhost:4200/admin/statistics
```

### 2. Verificar Prerequisitos
- ✅ Usuario autenticado
- ✅ Rol: administrador
- ✅ MS6 corriendo en Puerto 5006

### 3. Usar Filtros
```typescript
// Filtro por defecto (últimos 30 días)
startDate: "2024-11-01"
endDate: "2024-12-01"
limit: 10
```

### 4. Secciones Disponibles

#### 📊 Ventas
- Total de ventas
- Cantidad de pedidos
- Ticket promedio

#### 📦 Inventario
- Top 10 productos
- Stock muerto
- Stock por categoría

#### 👥 Usuarios
- Usuarios nuevos
- Total de usuarios
- Tasa de crecimiento

#### ⏰ Ocupación
- Horas pico
- Tasa de no-show

#### 🎯 Promociones
- Efectividad de promociones
- Uso por promoción
- Ingresos generados

### 5. Descargar Datos
```bash
# PDF
Click: "Descargar PDF"

# JSON
Click: "Descargar JSON"
```

---

## 🔧 Instalación de Dependencias Futuras

```bash
# Para gráficos (si quieres agregar después)
npm install chart.js ng2-charts

# Verificar instalación
npm list chart.js ng2-charts
```

---

## 🎯 Casos de Uso Comunes

### Ver Ventas del Mes
1. Selecciona fecha inicio: 1ro del mes
2. Selecciona fecha fin: Hoy
3. Click: "Actualizar"
4. Ver métricas en "Ventas"

### Identificar Productos Lentos
1. Ver sección "Stock Muerto"
2. Analizar productos sin movimiento
3. Considerar descuentos o promociones

### Analizar Crecimiento de Usuarios
1. Cambiar fecha a rango mayor (3 meses)
2. Ver tasa de crecimiento en "Usuarios"
3. Comparar con período anterior

### Optimizar Staffing
1. Ver "Horas Pico" en Ocupación
2. Aumentar personal en esas horas
3. Reducir en horas bajas

---

## ❌ Troubleshooting

### No puedo acceder al módulo
**Problema**: Error 403 Forbidden
**Solución**: Verifica que tu usuario sea administrador
```typescript
// En AuthService
user.tipoUsuario === 'administrador'  // Debe ser true
```

### No hay datos
**Problema**: Las secciones están vacías
**Solución**: Verifica que MS6 esté corriendo
```bash
# Verifica MS6
curl http://localhost:5006/analytics/sales/summary
```

### Error al descargar
**Problema**: El botón no funciona
**Solución**: Verifica la conexión a MS6 y que el endpoint /export esté activo

### Datos lentos
**Problema**: Las secciones tardan mucho
**Solución**: Los datos se cargan en paralelo, pero MS6 podría estar lento
```
Solución: Aumenta el limite de registros y filtra por período menor
```

---

## 🔐 Seguridad

El módulo verifica automáticamente:
1. ¿Estás autenticado? → Si no → /login
2. ¿Eres administrador? → Si no → /forbidden
3. ¿Token válido? → Si no → Actualiza

No hay datos sensibles expuestos en el cliente.

---

## 📱 Dispositivos

| Dispositivo | Resolución | Compatible |
|-------------|-----------|-----------|
| Mobile | < 576px | ✅ Sí |
| Tablet | 576-992px | ✅ Sí |
| Desktop | > 992px | ✅ Sí |
| Ultra Wide | > 1400px | ✅ Sí |

---

## ⚙️ Configuración

### Cambiar URL del API Gateway
**Archivo**: `src/app/config/environment.ts`
```typescript
export const environment = {
  apiGatewayUrl: 'http://tu-server:3000/api'  // Cambiar aquí
};
```

### Cambiar Formato de Fechas
**Archivo**: `src/app/shared/pipes/format-table-value.pipe.ts`
```typescript
// Cambiar formato DatePipe
return this.datePipe.transform(value, 'formato-personalizado');
```

### Cambiar Colores
**Archivo**: `statistics.component.scss`
```scss
// Cambiar color primario
border-left-color: #tu-color;
background-color: #f9f9f9;
```

---

## 📚 Documentación Completa

Para documentación detallada:
```
client/src/app/features/admin/pages/statistics/README.md
```

---

## 🆘 Soporte

Si algo no funciona:
1. Verifica console.log del navegador (F12)
2. Verifica red (F12 → Network)
3. Verifica que MS6 responde correctamente
4. Lee el README.md del módulo

---

## ✅ Checklist Antes de Producción

- [ ] MS6 configurado y corriendo
- [ ] Environment.ts apunta a servidor correcto
- [ ] Usuario de prueba es administrador
- [ ] Datos históricos cargados en MS6
- [ ] SSL/HTTPS configurado
- [ ] CORS habilitado en API Gateway
- [ ] Logs configurados
- [ ] Backups automáticos activos

---

¡Listo para usar! 🎉
