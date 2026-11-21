# ENTREGABLE QA — FRONTEND (`Ploty-Views`)

**Fecha:** 21 de Noviembre de 2026  
**Estado:** ✅ 100% Verificado — 86/86 Tests Unitarios y Build de Producción en Verde

---

## 1. Archivos Creados y Modificados

### Creados
- `src/common/fp/form-validators.fp.ts` — Validadores funcionales puros (`Result<T, E>`) para Login, Registro (incluyendo `evaluatePasswordStrength`), Actividades y Proyectos.
- `src/common/fp/form-validators.fp.spec.ts` — 11 tests unitarios para todos los validadores declarativos.
- `ENTREGABLE_QA_FRONTEND.md` — Este entregable de verificación QA.

### Modificados
- `src/services/api.ts` — Interceptor de respuesta `401 Unauthorized` que limpia sesión y redirige a `/login` sin bucles infinitos.
- `src/index.css` — Reglas limpias `@media print` que ocultan barra lateral, cabecera y controles `.no-print` al exportar a PDF.
- `src/common/fp/fp-core.ts` — Refactorización de `groupBy` con `reduce` inmutable (sin `for` ni `.push()`).
- `src/common/fp/index.ts` — Re-exportación de `chart-transformers.fp` y `form-validators.fp`.
- `src/common/fp/chart-transformers.fp.ts` & `chart-transformers.fp.spec.ts` — Nuevas funciones puras `buildConsistencyHeatmap(dailySeries, 30)`, `buildPlayerRadarMetrics(...)` (5 dimensiones) y `serializeReportToCsv(...)` con cobertura de tests ampliada (23 tests).
- `src/store/index.ts` — Configuración de `createListenerMiddleware()` para aislar la persistencia en `localStorage` y escuchar eventos `401`.
- `src/store/slices/authSlice.ts` & `authSlice.spec.ts` — `normalizeUserProfile` 100% pura (cero llamadas a `localStorage`), soporte de `equippedFrameId`/`equippedTitleId`, y tests verificando ausencia total de efectos secundarios.
- `src/store/slices/gamificationSlice.ts` — Thunk `equipItem` persistiendo los 4 slots reales (`THEME`, `MEDAL`, `AVATAR_FRAME`/`FRAME`, `TITLE`) contra `PATCH /gamification/equip`.
- `src/store/slices/projectsSlice.ts` — Alineación con contrato backend (`progressSummary`, `ownerId`, `isTeamProject`, `memberCount`) y nuevos thunks `updateProject` y `deleteProject`.
- `src/store/slices/activitiesSlice.ts` — Manejo específico de `409 Conflict` (`conflictNotice`), `clearActivitiesError`, y selectores memoizados con `createSelector` (`selectFilteredActivitiesMemo`, `selectActivitiesSummaryMemo`).
- `src/store/slices/reportsSlice.ts` — Migración a `contributionPercentage` en `TeamMemberContribution`, rango por defecto de `30` días, y 11 selectores memoizados con `createSelector`.
- `src/pages/auth/LoginPage.tsx` & `RegisterPage.tsx` — Integración de validación funcional pura con errores por campo, campo "Confirmar contraseña" y medidor visual de fortaleza de contraseña.
- `src/pages/activities/ActivitiesPage.tsx` — CRUD completo en UI (Crear, Editar, Eliminar con confirmación, botón rápido "Marcar En Progreso", asignación de responsable de proyecto), banner de errores del backend y aviso amigable en `409 Conflict`.
- `src/pages/projects/ProjectsPage.tsx` & `ProjectDetailModal.tsx` — Alineación con `progressSummary`/`ownerId`/`memberCount`, toggle Individual/Equipo, eliminación de rol inexistente `VIEWER` (solo `MEMBER` y `ADMIN`), y edición/eliminación de proyectos según rol.
- `src/pages/shop/ShopPage.tsx` & `src/components/NavbarHUD.tsx` — Equipamiento persistente de Marcos y Títulos vía API real y visualización inmediata en el HUD.
- `src/pages/reports/ReportsPage.tsx` — Sincronización dinámica de Recharts con los 5 temas activos, `ComposedChart` con Media Móvil 3d y Días Pico destacados, Heatmap de Constancia (30 días), `RadarChart` de 5 dimensiones, `contributionPercentage`, y botones **Exportar CSV** e **Imprimir / PDF**.

---

## 2. Resultados de Verificación

| Comando | Resultado |
| :--- | :--- |
| `npm test` (`vitest run`) | ✅ **10 archivos pasados / 86 tests pasados (0 fallos)** |
| `npm run build` (`tsc -b && vite build`) | ✅ **0 errores de TypeScript/Vite** (`dist/` generado en 2.90s) |

---

## 3. URL Local y Checklist Rápido de Prueba QA (5 Pasos)

- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3000](http://localhost:3000) (Swagger: [http://localhost:3000/api/docs](http://localhost:3000/api/docs))
- **Credenciales Demo:** `demo@ploty.app` / `Demo1234!`

### Checklist de 5 Pasos
1. **Login & HUD Persistente:** Inicia sesión con `demo@ploty.app` / `Demo1234!`. Comprueba que el `NavbarHUD` muestra Nivel 3, 480 monedas, racha de 5 días, medalla equipada, marco holográfico en el avatar y título *Maestro Funcional*. Recarga (`F5`) para verificar persistencia.
2. **CRUD de Actividades & Cooldown 409:** En `/activities`, marca una tarea `PENDING` como *En Progreso*, edita una tarea, asigna un responsable de *Plataforma Ploty — Equipo* y completa el hábito diario *Katas diarias de Programación Funcional*. Al intentar completarlo una segunda vez hoy, verifica el aviso amigable de ciclo ya cumplido (`409 Conflict`).
3. **Proyectos Colaborativos:** En `/projects`, verifica el progreso calculado incluyendo hábitos recurrentes, abre *Plataforma Ploty — Equipo*, comprueba que el selector de invitación solo ofrece `MEMBER` y `ADMIN`, y prueba el formulario inline de editar proyecto (toggle Individual/Equipo).
4. **Tienda Persistente (4 Slots):** En `/shop`, equipa un tema (p. ej. *Ploty Indigo Core* o compra *Cyberpunk Neon Overdrive*), un marco y un título; recarga la página (`F5`) y confirma que el tema, marco y título persisten desde la base de datos.
5. **Reportes Profesionales & Exportación:** En `/reports`, cambia de tema desde la tienda y verifica que todas las gráficas (`ComposedChart` con media móvil y días pico, Heatmap de 30 días, `RadarChart` de 5 dimensiones y Donut) adoptan la paleta activa. Prueba **Exportar CSV** e **Imprimir / PDF**, y cambia al ámbito *Por Proyecto* para ver `contributionPercentage` de `fabio_demo`, `ana_dev` y `carlos_ux`.
