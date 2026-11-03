# 🚀 Ploty-Views: Frontend Tactile Bento & Gamification Engine

Frontend oficial de **Ploty**, la plataforma gamificada de gestión de proyectos y hábitos construida con **React 19, Vite, TypeScript, Redux Toolkit, Tailwind CSS v3 y Framer Motion**.

---

## 🎨 Características Principales (Hitos 3 y 4)

1. **Estética Tactile Bento & Paleta Nivel 0:**
   - White (`#FFFFFF`), Charcoal (`#312F30`), Electric Periwinkle (`#7477FF`), Vibrant Coral (`#F66554`), Solar Gold (`#F9CD61`) y Soft Sage (`#C5D4CA`).
   - Sombras táctiles `shadow-tactile` y física de resortes (`springConfig`) con animaciones de resorte.
2. **Motor de 4 Temas Dinámicos Extremos con Live Preview:**
   - `THEME_DEFAULT_PLOTY`: Ploty Tactile Bento Nivel 0.
   - `THEME_CYBERPUNK_NEON`: Cyberpunk Neon Overdrive (Cyan `#00F0FF` y Magenta `#FF007F` con resplandor neón).
   - `THEME_SOLAR_GOLD`: Solar Flare Executive (Ámbar `#F59E0B` y Oro `#FDE047`).
   - `THEME_EMERALD_MATRIX`: Emerald Matrix Hacker (Verde cibernético `#10B981` y `#34D399`).
   - Modo **Previsualizar Tema 👁️** con cambio instantáneo de variables CSS globales en caliente y partículas de confeti adaptativas.
3. **Visual Analytics & Dashboard de 5 Módulos Bento (`ReportsPage.tsx`):**
   - **Área Interactiva:** Capacidad y tendencia diaria de XP con detección de día pico (`isPeakDay`).
   - **Barras Apiladas:** Desglose de rendimiento por prioridad (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) y comparativa de tareas únicas vs hábitos recurrentes.
   - **Dial Donut:** Sincronización y distribución de estados con Score de Eficiencia en el centro.
   - **Avance de Proyectos & Contribución de Equipo:** Avance de proyectos en vista global y desglose de aportes por miembro en vista de proyecto.
   - **Explorador Visual de Progreso por Acción (`ActionProgressExplorer`):** Búsqueda instantánea, filtros por tipo y ordenamiento por % de avance, ejecuciones y XP.
4. **Gamificación Extrema y Modal Épico:**
   - Confeti dopamínico dual (`triggerDopamineConfetti`).
   - Ráfaga especial de celebración de subida de nivel (`triggerLevelUpCelebration`) y modal épico (`LevelUpAndUnlockModal.tsx`).
   - Vitrina 3D con efecto de inclinación holográfica para medallas, marcos de avatar pulsantes (`AVATAR_FRAME`) y títulos honoríficos (`TITLE`).
5. **Arquitectura Funcional Pura (`src/common/fp/`):**
   - Inmutabilidad estricta con `Object.freeze`, pipelines funcionales (`pipe`, `map`, `filter`, `reduce`, `sortBy`), mónada `Result` y selectores puros.

---

## 🛠️ Requisitos Previos

- **Node.js:** v20+ o v22+
- **Docker & Docker Compose** (para ejecutar la base de datos PostgreSQL y opcionalmente los contenedores)

---

## 🏃 Guía Rápida para Levantar Ambos Servidores

### 1. Iniciar el Backend (`Ploty-dev`)
```bash
# Navegar al directorio del backend
cd Ploty-dev

# Asegurarse de que el contenedor de PostgreSQL esté corriendo (puerto 5434)
docker compose up -d ploty-db

# Aplicar migraciones de Prisma
npx prisma migrate deploy

# Ejecutar el servidor NestJS en modo desarrollo (puerto 3000)
npm run start:dev
```
*El backend quedará escuchando en `http://localhost:3000` con Swagger UI en `http://localhost:3000/docs`.*

---

### 2. Iniciar el Frontend (`Ploty-Views`)
```bash
# Navegar al directorio del frontend
cd Ploty-Views

# Instalar dependencias (si no se han instalado)
npm install

# Iniciar servidor de desarrollo con Vite (puerto 5173)
npm run dev
```
*El frontend quedará escuchando en `http://localhost:5173`.*

---

## 🧪 Ejecución de Pruebas Unitarias

```bash
# En el directorio Ploty-Views
npm test
```
*Ejecuta la suite completa de 56 pruebas con Vitest (100% aprobadas).*

---

## 📦 Compilación para Producción

```bash
npm run build
```
*Genera los archivos optimizados listos para producción en el directorio `dist/`.*

---

## 🐳 Despliegue con Docker

```bash
# Construir la imagen Docker multi-stage (Node 22 + Nginx)
docker build -t ploty-views:latest .

# Ejecutar el contenedor en el puerto 80 (o mapeado a 5173)
docker run -p 5173:80 ploty-views:latest
```
