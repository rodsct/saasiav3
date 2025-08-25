# 🚀 SaaS v3 - Guía de Instalación en Servidor

## 📋 Requisitos del Servidor

- **Docker** y **Docker Compose** instalados
- **2GB RAM** mínimo (4GB recomendado)
- **10GB** espacio libre en disco
- **Puerto 80/443** disponibles para Nginx
- **Dominio** configurado (opcional para SSL)

## ⚡ Instalación Rápida

### 1. Clonar el Repositorio
```bash
git clone https://github.com/rodsct/saasiav3.git
cd saasiav3
```

### 2. Configurar Variables de Entorno
```bash
# Copiar archivo de configuración
cp .env.production .env.production.local

# Editar configuración (CAMBIAR TODOS LOS VALORES PREDETERMINADOS)
nano .env.production.local
```

**⚠️ IMPORTANTE:** Cambiar estas variables obligatoriamente:
- `POSTGRES_PASSWORD` - Contraseña segura de PostgreSQL
- `REDIS_PASSWORD` - Contraseña segura de Redis  
- `NEXTAUTH_SECRET` - Secreto muy largo y seguro (32+ caracteres)
- `NEXTAUTH_URL` - Tu dominio real (ej: https://tu-dominio.com)
- `NEXT_PUBLIC_SITE_URL` - Tu dominio público

### 3. Ejecutar Instalación

#### En Linux/Mac:
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

#### En Windows:
```batch
scripts\deploy.bat
```

## 🔧 Configuración Manual

### Paso 1: Iniciar Servicios
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### Paso 2: Configurar Base de Datos
```bash
# Esperar a que la DB esté lista
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U saasiav3

# Ejecutar migraciones
docker-compose -f docker-compose.prod.yml exec app npx prisma db push
```

### Paso 3: Crear Usuario Administrador
```bash
# Crear usuarios de prueba (incluye admin)
docker-compose -f docker-compose.prod.yml exec app curl -X POST http://localhost:3000/api/debug/create-test-user
```

## 🌐 Acceso a la Aplicación

- **Aplicación:** http://tu-servidor:3000
- **Admin Panel:** http://tu-servidor:3000/admin
- **Login Admin:** `admin@aranza.io` / `test123`

## 🔐 Configurar SSL (Opcional)

### 1. Obtener Certificados SSL
```bash
# Con Let's Encrypt (ejemplo)
certbot certonly --standalone -d tu-dominio.com
```

### 2. Copiar Certificados
```bash
mkdir -p docker/nginx/ssl
cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem docker/nginx/ssl/
cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem docker/nginx/ssl/
```

### 3. Habilitar HTTPS en Nginx
Descomenta las líneas HTTPS en `docker/nginx/nginx.conf`

## 💳 Configurar Stripe (Opcional)

### 1. Obtener Claves de Stripe
- Ve a [dashboard.stripe.com](https://dashboard.stripe.com)
- Copia: Publishable Key, Secret Key, Webhook Secret

### 2. Configurar Webhook
- **URL:** `https://tu-dominio.com/api/webhooks/stripe`
- **Eventos:** `checkout.session.completed`, `invoice.payment_succeeded`

### 3. Actualizar .env.production
```bash
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## 📊 Monitoreo y Mantenimiento

### Ver Logs
```bash
# Todos los servicios
docker-compose -f docker-compose.prod.yml logs -f

# Solo aplicación
docker-compose -f docker-compose.prod.yml logs -f app

# Solo base de datos
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### Estado de Servicios
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Backup de Base de Datos
```bash
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U saasiav3 saasiav3 > backup.sql
```

### Actualizar Aplicación
```bash
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build app
```

## 🛠️ Solución de Problemas

### Problema: Base de datos no conecta
```bash
# Verificar estado de PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U saasiav3

# Reiniciar base de datos
docker-compose -f docker-compose.prod.yml restart postgres
```

### Problema: Aplicación no inicia
```bash
# Ver logs detallados
docker-compose -f docker-compose.prod.yml logs app

# Verificar variables de entorno
docker-compose -f docker-compose.prod.yml exec app env | grep -E "(DATABASE|NEXTAUTH)"
```

### Problema: Puerto ocupado
```bash
# Cambiar puerto en .env.production
APP_PORT=3001

# O liberar puerto 3000
sudo fuser -k 3000/tcp
```

## 🔧 Comandos Útiles

### Reiniciar Todo
```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### Limpiar Volúmenes (¡CUIDADO! Borra datos)
```bash
docker-compose -f docker-compose.prod.yml down -v
docker system prune -a
```

### Entrar al Contenedor
```bash
# Aplicación
docker-compose -f docker-compose.prod.yml exec app sh

# Base de datos
docker-compose -f docker-compose.prod.yml exec postgres psql -U saasiav3 -d saasiav3
```

## 📁 Estructura de Archivos

```
saasiav3/
├── docker-compose.prod.yml      # Configuración Docker producción
├── Dockerfile.prod              # Imagen optimizada
├── .env.production             # Variables de entorno
├── scripts/
│   ├── deploy.sh              # Script instalación Linux/Mac
│   └── deploy.bat             # Script instalación Windows
├── docker/
│   ├── nginx/
│   │   ├── nginx.conf         # Configuración Nginx
│   │   └── ssl/               # Certificados SSL
│   └── postgres/
│       └── init.sql           # Inicialización DB
└── README.deployment.md        # Esta guía
```