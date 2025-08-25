# 🚀 SaaS v3 - Instalación EasyPanel

Guía para desplegar SaaS v3 en EasyPanel con Docker Compose.

## 📋 Archivos para EasyPanel

- `docker-compose.easypanel.yml` - Configuración Docker Compose
- `Dockerfile.prod` - Imagen optimizada de producción
- `.env.production.example` - Variables de entorno

## ⚡ Instalación en EasyPanel

### 1. Crear Nuevo Proyecto
1. Ve a tu panel de EasyPanel
2. Crea un nuevo proyecto llamado `saasiav3`
3. Selecciona "Docker Compose" como tipo de aplicación

### 2. Subir Archivos
Sube estos archivos a tu proyecto EasyPanel:
- `docker-compose.easypanel.yml` (renómbralo a `docker-compose.yml`)
- Todo el código fuente del proyecto

### 3. Configurar Variables de Entorno

En EasyPanel, configura estas variables **obligatorias**:

```env
# Base de Datos
POSTGRES_PASSWORD=tu_password_postgresql_seguro

# Redis
REDIS_PASSWORD=tu_password_redis_seguro

# Autenticación
NEXTAUTH_SECRET=tu_nextauth_secret_muy_largo_32_caracteres_minimo
NEXTAUTH_URL=https://tu-dominio.easypanel.app

# Sitio Web
NEXT_PUBLIC_SITE_URL=https://tu-dominio.easypanel.app
SITE_NAME=Aranza.io

# Email (opcional)
EMAIL_FROM=noreply@tu-dominio.com
```

### 4. Variables Opcionales

```env
# OAuth (opcional)
GITHUB_CLIENT_ID=tu_github_client_id
GITHUB_CLIENT_SECRET=tu_github_client_secret
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# Stripe (configura después)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# n8n Webhook (usa el predeterminado o cambia)
DEFAULT_N8N_WEBHOOK=https://infra-v2-n8n-v2.uclxiv.easypanel.host/webhook/saasiav3
```

### 5. Desplegar
1. Haz clic en "Deploy" en EasyPanel
2. Espera a que se construyan los contenedores
3. EasyPanel ejecutará automáticamente los servicios

### 6. Configuración Post-Despliegue

Una vez desplegado, ejecuta estos comandos en la terminal de EasyPanel:

```bash
# 1. Migrar base de datos
docker exec saasiav3-app npx prisma db push

# 2. Crear usuarios de prueba (incluye admin)
curl -X POST https://tu-dominio.easypanel.app/api/debug/create-test-user
```

## 🌐 Acceso a la Aplicación

- **Aplicación**: https://tu-dominio.easypanel.app
- **Admin Panel**: https://tu-dominio.easypanel.app/admin
- **Login Admin**: `admin@aranza.io` / `test123`

## 💳 Configurar Stripe

### 1. Configurar Webhook en Stripe Dashboard
- **URL**: `https://tu-dominio.easypanel.app/api/webhooks/stripe`
- **Eventos**: 
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `customer.subscription.deleted`

### 2. Obtener Claves
En [dashboard.stripe.com](https://dashboard.stripe.com):
- Publishable Key: `pk_live_...`
- Secret Key: `sk_live_...`
- Webhook Secret: `whsec_...`

### 3. Actualizar Variables en EasyPanel
Agrega las claves de Stripe a las variables de entorno en EasyPanel.

## 📊 Servicios Incluidos

- **PostgreSQL 15** - Base de datos principal
- **Redis 7** - Cache y sesiones
- **Next.js 15** - Aplicación web
- **Prisma** - ORM y migraciones
- **Nginx** - Reverse proxy (EasyPanel lo maneja)

## 🔧 Comandos Útiles

### Ver Logs
```bash
# Logs de aplicación
docker logs saasiav3-app -f

# Logs de base de datos
docker logs saasiav3-postgres -f
```

### Health Check
```bash
curl https://tu-dominio.easypanel.app/api/health
```

### Backup Base de Datos
```bash
docker exec saasiav3-postgres pg_dump -U saasiav3 saasiav3 > backup.sql
```

## 🛠️ Funcionalidades

- ✅ **Chatbot Aranza** - IA con n8n webhook
- ✅ **Sistema de Descargas** - Archivos con control de acceso
- ✅ **Panel de Admin** - Gestión completa
- ✅ **Autenticación JWT** - Login seguro
- ✅ **Suscripciones PRO** - Stripe integration ready
- ✅ **Promociones** - Sistema de códigos descuento
- ✅ **Health Monitoring** - Endpoints de salud

## 📝 Notas EasyPanel

- EasyPanel maneja automáticamente SSL/HTTPS
- Los puertos se mapean automáticamente
- Las redes Docker se crean automáticamente
- Los volúmenes persisten los datos
- Health checks monitorizan los servicios

¡Tu aplicación estará lista para producción! 🚀