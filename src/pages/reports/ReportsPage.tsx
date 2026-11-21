import React, { useEffect, useState, useMemo, Component, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  Globe,
  FolderKanban,
  Search,
  Repeat,
  Zap,
  Users,
  Award,
  AlertTriangle,
  Download,
  Printer,
  CalendarDays,
  Compass,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchDashboardReport,
  fetchProjectReport,
  setDaysRange,
  setSelectedProjectId,
  selectGlobalDailyTrendMemo,
  selectProjectDailyTrendMemo,
  selectGlobalEfficiencyScoreMemo,
  selectGlobalProjectComparisonMemo,
  selectGlobalRecurrenceStatsMemo,
  selectGlobalPriorityChartMemo,
  selectProjectPriorityChartMemo,
  selectGlobalStatusPieMemo,
  selectProjectStatusPieMemo,
  selectGlobalHeatmapMemo,
  selectGlobalRadarMetricsMemo,
} from '../../store/slices/reportsSlice';
import { fetchProjects } from '../../store/slices/projectsSlice';
import {
  filterAndSortActionProgress,
  serializeReportToCsv,
  type HeatmapCell,
} from '../../common/fp/chart-transformers.fp';
import { resolveThemeTokens } from '../../common/fp/theme-resolver.fp';
import { BentoSpringCard } from '../../common/motion/BentoSpringCard';
import { springConfig } from '../../common/motion/motion-skills';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ReportsErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.error('Reports ErrorBoundary caught an error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-3xl bg-ploty-white text-ploty-charcoal border-2 border-ploty-coral/40 shadow-tactile flex flex-col items-center justify-center text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-ploty-coral animate-bounce" />
          <h3 className="text-xl font-black">Panel de Métricas en Calibración</h3>
          <p className="text-sm text-ploty-charcoal/70 max-w-md">
            No se pudieron renderizar algunas visualizaciones complejas con los datos actuales. Recarga la página o completa una actividad para generar nuevas métricas.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 rounded-2xl bg-ploty-periwinkle text-ploty-white font-black text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Reintentar Renderizado
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const ReportsPageContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dashboard, projectReport, selectedDaysRange, selectedProjectId } =
    useAppSelector((state) => state.reports);
  const projects = useAppSelector((state) => state.projects.projects);
  const user = useAppSelector((state) => state.auth.user);
  const previewTheme = useAppSelector((state) => state.gamification.previewTheme);

  // Active theme tokens synced directly into Recharts visualizations
  const themeTokens = useMemo(
    () => resolveThemeTokens(previewTheme || user?.equippedTheme),
    [previewTheme, user?.equippedTheme],
  );

  // Memoized Redux selectors (createSelector)
  const globalDailyTrend = useAppSelector(selectGlobalDailyTrendMemo);
  const projectDailyTrend = useAppSelector(selectProjectDailyTrendMemo);
  const efficiencyScore = useAppSelector(selectGlobalEfficiencyScoreMemo);
  const projectComparison = useAppSelector(selectGlobalProjectComparisonMemo);
  const recurrenceStats = useAppSelector(selectGlobalRecurrenceStatsMemo);
  const globalPriorityData = useAppSelector(selectGlobalPriorityChartMemo);
  const projectPriorityData = useAppSelector(selectProjectPriorityChartMemo);
  const globalStatusPie = useAppSelector(selectGlobalStatusPieMemo);
  const projectStatusPie = useAppSelector(selectProjectStatusPieMemo);
  const heatmapCells = useAppSelector(selectGlobalHeatmapMemo);
  const radarMetrics = useAppSelector(selectGlobalRadarMetricsMemo);

  const [scope, setScope] = useState<'GLOBAL' | 'PROJECT'>('GLOBAL');
  const [actionFilter, setActionFilter] = useState<'ALL' | 'SINGLE' | 'RECURRING'>('ALL');
  const [actionSearch, setActionSearch] = useState('');
  const [actionSort, setActionSort] = useState<
    'progressPercent' | 'totalExecutions' | 'xpGenerated'
  >('progressPercent');
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchDashboardReport(selectedDaysRange));
  }, [dispatch, selectedDaysRange]);

  useEffect(() => {
    if (selectedProjectId) {
      dispatch(fetchProjectReport(selectedProjectId));
      setScope('PROJECT');
    }
  }, [selectedProjectId, dispatch]);

  const handleScopeChange = (newScope: 'GLOBAL' | 'PROJECT') => {
    setScope(newScope);
    if (newScope === 'GLOBAL') {
      dispatch(setSelectedProjectId(null));
    } else if (projects.length > 0 && !selectedProjectId) {
      dispatch(setSelectedProjectId(projects[0].id));
    }
  };

  const handleProjectSelect = (projId: string) => {
    dispatch(setSelectedProjectId(projId));
    dispatch(fetchProjectReport(projId));
  };

  const activeDailyTrend =
    scope === 'GLOBAL' ? globalDailyTrend : projectDailyTrend;

  const priorityChartData =
    scope === 'GLOBAL' ? globalPriorityData : projectPriorityData;

  const statusPieData = useMemo(() => {
    const base = scope === 'GLOBAL' ? globalStatusPie : projectStatusPie;
    const themedColors: Record<string, string> = {
      COMPLETED: themeTokens.accentColor,
      IN_PROGRESS: themeTokens.primaryColor,
      PENDING: themeTokens.goldColor,
      OVERDUE: themeTokens.dark,
    };
    return base.map((item) => ({
      ...item,
      color: themedColors[item.name] || themeTokens.primaryColor,
    }));
  }, [scope, globalStatusPie, projectStatusPie, themeTokens]);

  const activeActionProgressList = useMemo(() => {
    const raw =
      scope === 'GLOBAL'
        ? dashboard?.actionProgressList
        : projectReport?.actionProgress;
    return filterAndSortActionProgress(raw, actionFilter, actionSearch, actionSort);
  }, [
    scope,
    dashboard?.actionProgressList,
    projectReport?.actionProgress,
    actionFilter,
    actionSearch,
    actionSort,
  ]);

  const handleExportCsv = () => {
    const csvContent = serializeReportToCsv({
      scope,
      projectName: projectReport?.project?.name,
      actions: activeActionProgressList,
      projects: dashboard?.projectsProgress,
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `ploty-reporte-${scope.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const isDarkTheme = themeTokens.themeCode !== 'THEME_DEFAULT';
  const cardSurfaceStyle: React.CSSProperties = {
    backgroundColor: themeTokens.card,
    color: themeTokens.textColor,
    borderColor: isDarkTheme ? `${themeTokens.primaryColor}35` : 'rgba(49,47,48,0.12)',
  };

  const tooltipContentStyle: React.CSSProperties = {
    backgroundColor: themeTokens.dark,
    borderRadius: '16px',
    color: '#FFFFFF',
    border: `2px solid ${themeTokens.primaryColor}`,
    fontWeight: 'bold',
    fontSize: '12px',
  };

  const getHeatmapCellColor = (intensity: 0 | 1 | 2 | 3 | 4): string => {
    if (intensity === 0) {
      return isDarkTheme ? 'rgba(255,255,255,0.07)' : 'rgba(49,47,48,0.08)';
    }
    const alphas: Record<number, string> = {
      1: '40',
      2: '80',
      3: 'BF',
      4: 'FF',
    };
    const baseHex =
      intensity === 4 ? themeTokens.accentColor : themeTokens.primaryColor;
    return `${baseHex}${alphas[intensity]}`;
  };

  return (
    <div className="space-y-6">
      {/* Scope Selector, Range Controls & Export Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig.tactile}
        style={{
          backgroundColor: themeTokens.dark,
          color: '#FFFFFF',
          borderColor: `${themeTokens.primaryColor}45`,
        }}
        className="p-6 sm:p-8 rounded-3xl shadow-tactile border-2 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl text-xs font-black uppercase tracking-wider border"
            style={{
              backgroundColor: `${themeTokens.primaryColor}25`,
              borderColor: `${themeTokens.primaryColor}60`,
              color: themeTokens.primaryColor,
            }}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Métricas Bento & Analítica Dinámica ({themeTokens.name})</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Dashboard de Rendimiento, Constancia & Radar
          </h2>
          <p className="text-sm text-white/75 max-w-xl">
            Visualizaciones sincronizadas al tema activo con media móvil de XP, días pico, heatmap de 30 días, perfil radar y exportación CSV/PDF.
          </p>
        </div>

        {/* Controls & Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap no-print">
          {/* Scope Toggle */}
          <div className="flex items-center bg-white/10 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => handleScopeChange('GLOBAL')}
              style={
                scope === 'GLOBAL'
                  ? { backgroundColor: themeTokens.primaryColor, color: '#FFFFFF' }
                  : undefined
              }
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                scope === 'GLOBAL' ? 'shadow-sm' : 'text-white/70 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Global
            </button>
            <button
              onClick={() => handleScopeChange('PROJECT')}
              style={
                scope === 'PROJECT'
                  ? { backgroundColor: themeTokens.primaryColor, color: '#FFFFFF' }
                  : undefined
              }
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                scope === 'PROJECT' ? 'shadow-sm' : 'text-white/70 hover:text-white'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" /> Por Proyecto
            </button>
          </div>

          {/* Range Pills or Project Select */}
          {scope === 'GLOBAL' ? (
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/10">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => dispatch(setDaysRange(days))}
                  style={
                    selectedDaysRange === days
                      ? { backgroundColor: themeTokens.accentColor, color: '#FFFFFF' }
                      : undefined
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedDaysRange === days
                      ? 'shadow-sm'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          ) : (
            <select
              value={selectedProjectId || ''}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/20 text-xs font-bold text-white focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="text-slate-900">
                  {p.icon} {p.name}
                </option>
              ))}
            </select>
          )}

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            style={{
              backgroundColor: `${themeTokens.goldColor}25`,
              borderColor: `${themeTokens.goldColor}70`,
              color: themeTokens.goldColor,
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-black hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          {/* Print / PDF Button */}
          <button
            type="button"
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-black transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </motion.div>

      {/* Top Quick Metric Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print-break-avoid">
        <div
          style={cardSurfaceStyle}
          className="p-4 rounded-3xl shadow-tactile border-2 flex items-center gap-3"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${themeTokens.primaryColor}25`,
              color: themeTokens.primaryColor,
            }}
          >
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase opacity-65">
              Índice de Eficiencia
            </p>
            <p
              className="text-xl font-black"
              style={{ color: themeTokens.primaryColor }}
            >
              {efficiencyScore}%
            </p>
          </div>
        </div>

        <div
          style={cardSurfaceStyle}
          className="p-4 rounded-3xl shadow-tactile border-2 flex items-center gap-3"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${themeTokens.accentColor}25`,
              color: themeTokens.accentColor,
            }}
          >
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase opacity-65">
              Cumplimiento
            </p>
            <p
              className="text-xl font-black"
              style={{ color: themeTokens.accentColor }}
            >
              {scope === 'GLOBAL'
                ? dashboard?.overview?.completionRate ?? 0
                : projectReport?.project?.progressPercent ?? 0}
              %
            </p>
          </div>
        </div>

        <div
          style={cardSurfaceStyle}
          className="p-4 rounded-3xl shadow-tactile border-2 flex items-center gap-3"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${themeTokens.goldColor}25`,
              color: themeTokens.goldColor,
            }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase opacity-65">
              XP Total Ganada
            </p>
            <p className="text-xl font-black">{dashboard?.overview?.xp ?? 0}</p>
          </div>
        </div>

        <div
          style={cardSurfaceStyle}
          className="p-4 rounded-3xl shadow-tactile border-2 flex items-center gap-3"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${themeTokens.accentColor}25`,
              color: themeTokens.accentColor,
            }}
          >
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase opacity-65">
              Racha Activa
            </p>
            <p className="text-xl font-black">
              {dashboard?.overview?.currentStreak ?? 0} días
            </p>
          </div>
        </div>
      </div>

      {/* Main Bento Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: ComposedChart — XP Diaria + Media Móvil 3d + Días Pico */}
        <BentoSpringCard
          className="p-6 sm:p-8 rounded-3xl shadow-tactile border-2 flex flex-col justify-between print-break-avoid"
          style={{
            backgroundColor: themeTokens.primaryColor,
            color: '#FFFFFF',
            borderColor: themeTokens.dark,
          }}
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white" />
              <h3 className="text-lg font-black tracking-tight">
                Tendencia XP, Media Móvil & Días Pico
              </h3>
            </div>
            <span className="text-xs font-black px-3 py-1 rounded-xl bg-white/20">
              {selectedDaysRange} Días
            </span>
          </div>

          <div className="h-64 min-h-[260px] w-full">
            {activeDailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={activeDailyTrend.map((d) => ({ ...d }))}>
                  <defs>
                    <linearGradient id="xpThemeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.85} />
                      <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.08} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.22)"
                  />
                  <XAxis
                    dataKey="shortDate"
                    stroke="#FFFFFF"
                    tick={{ fill: '#FFFFFF', fontSize: 11, fontWeight: 700 }}
                  />
                  <YAxis
                    stroke="#FFFFFF"
                    tick={{ fill: '#FFFFFF', fontSize: 11, fontWeight: 700 }}
                  />
                  <Tooltip contentStyle={tooltipContentStyle} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', fontWeight: 800, color: '#FFFFFF' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="xpGained"
                    stroke="#FFFFFF"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#xpThemeGradient)"
                    name="XP Ganada"
                    dot={(props: any) => {
                      const { cx, cy, payload, index } = props;
                      if (!payload?.isPeakDay) {
                        return (
                          <circle
                            key={`dot-${index}`}
                            cx={cx}
                            cy={cy}
                            r={3}
                            fill="#FFFFFF"
                          />
                        );
                      }
                      return (
                        <circle
                          key={`peak-${index}`}
                          cx={cx}
                          cy={cy}
                          r={7}
                          fill={themeTokens.goldColor}
                          stroke={themeTokens.dark}
                          strokeWidth={2.5}
                        />
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="xpMovingAvg"
                    stroke={themeTokens.goldColor}
                    strokeWidth={3}
                    strokeDasharray="6 3"
                    dot={false}
                    name="Media Móvil (3d)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-white/80">
                Aún no hay suficientes métricas registradas para este periodo.
              </div>
            )}
          </div>
          <p className="text-[11px] font-bold text-white/80 mt-2">
            ● Puntos dorados grandes indican tus <strong>días pico</strong> de mayor XP ganada.
          </p>
        </BentoSpringCard>

        {/* Module 2: Rendimiento por Prioridad y Hábitos (BarChart) */}
        <BentoSpringCard
          className="p-6 sm:p-8 rounded-3xl shadow-tactile border-2 flex flex-col justify-between print-break-avoid"
          style={{
            backgroundColor: themeTokens.accentColor,
            color: '#FFFFFF',
            borderColor: themeTokens.dark,
          }}
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-white" />
              <h3 className="text-lg font-black tracking-tight">
                Rendimiento por Prioridad
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs font-black">
              <span className="bg-white/20 px-2.5 py-1 rounded-xl">
                ⚡ Únicas: {recurrenceStats.single.completed}
              </span>
              <span className="bg-white/20 px-2.5 py-1 rounded-xl">
                🔄 Hábitos: {recurrenceStats.recurring.totalExecutions}
              </span>
            </div>
          </div>

          <div className="h-64 min-h-[260px] w-full">
            {priorityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData.map((d) => ({ ...d }))}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.22)"
                  />
                  <XAxis
                    dataKey="priority"
                    stroke="#FFFFFF"
                    tick={{ fill: '#FFFFFF', fontSize: 11, fontWeight: 700 }}
                  />
                  <YAxis
                    stroke="#FFFFFF"
                    tick={{ fill: '#FFFFFF', fontSize: 11, fontWeight: 700 }}
                  />
                  <Tooltip contentStyle={tooltipContentStyle} />
                  <Bar dataKey="Total" fill="#FFFFFF" opacity={0.4} radius={[8, 8, 0, 0]} />
                  <Bar
                    dataKey="Completadas"
                    fill={themeTokens.goldColor}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-white/80">
                Aún no hay suficientes actividades registradas por prioridad.
              </div>
            )}
          </div>
        </BentoSpringCard>

        {/* Module 3: 30-Day Consistency Heatmap */}
        <BentoSpringCard
          className="p-6 sm:p-8 rounded-3xl shadow-tactile border-2 flex flex-col justify-between print-break-avoid"
          style={cardSurfaceStyle}
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <CalendarDays
                className="w-5 h-5"
                style={{ color: themeTokens.primaryColor }}
              />
              Heatmap de Constancia (Últimos 30 Días)
            </h3>

            {/* Intensity Legend */}
            <div className="flex items-center gap-1 text-[10px] font-black opacity-75">
              <span>Menos</span>
              {([0, 1, 2, 3, 4] as const).map((lvl) => (
                <span
                  key={lvl}
                  className="w-3.5 h-3.5 rounded-md border border-black/10"
                  style={{ backgroundColor: getHeatmapCellColor(lvl) }}
                />
              ))}
              <span>Más</span>
            </div>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 my-auto py-2">
            {heatmapCells.map((cell) => (
              <button
                key={cell.date}
                type="button"
                onMouseEnter={() => setHoveredCell(cell)}
                onFocus={() => setHoveredCell(cell)}
                title={`${cell.shortDate}: ${cell.completedCount} actividades · +${cell.xpEarned} XP`}
                style={{
                  backgroundColor: getHeatmapCellColor(cell.intensity),
                  borderColor:
                    hoveredCell?.date === cell.date
                      ? themeTokens.goldColor
                      : 'rgba(0,0,0,0.08)',
                }}
                className="aspect-square rounded-xl border-2 transition-transform hover:scale-110 flex flex-col items-center justify-center cursor-pointer"
              >
                <span
                  className="text-[9px] font-black leading-none"
                  style={{
                    color:
                      cell.intensity >= 2
                        ? '#FFFFFF'
                        : themeTokens.textColor,
                    opacity: cell.intensity === 0 ? 0.55 : 1,
                  }}
                >
                  {cell.date.slice(8, 10)}
                </span>
              </button>
            ))}
          </div>

          {/* Interactive Tooltip Strip */}
          <div
            className="mt-4 p-3 rounded-2xl text-xs font-bold flex items-center justify-between border"
            style={{
              backgroundColor: isDarkTheme
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(197,212,202,0.25)',
              borderColor: `${themeTokens.primaryColor}30`,
            }}
          >
            {hoveredCell ? (
              <>
                <span>
                  📅 <strong>{hoveredCell.shortDate}</strong> ({hoveredCell.date})
                </span>
                <span className="flex items-center gap-3 font-black">
                  <span style={{ color: themeTokens.accentColor }}>
                    {hoveredCell.completedCount} completadas
                  </span>
                  <span style={{ color: themeTokens.primaryColor }}>
                    +{hoveredCell.xpEarned} XP
                  </span>
                </span>
              </>
            ) : (
              <span className="opacity-70">
                Pasa el cursor sobre cualquier día del calendario para inspeccionar su XP y completitudes.
              </span>
            )}
          </div>
        </BentoSpringCard>

        {/* Module 4: Radar de Perfil del Jugador */}
        <BentoSpringCard
          className="p-6 sm:p-8 rounded-3xl shadow-tactile border-2 flex flex-col justify-between print-break-avoid"
          style={cardSurfaceStyle}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <Compass
                className="w-5 h-5"
                style={{ color: themeTokens.accentColor }}
              />
              Radar de Perfil del Jugador
            </h3>
            <span
              className="text-xs font-black px-3 py-1 rounded-xl"
              style={{
                backgroundColor: `${themeTokens.primaryColor}20`,
                color: themeTokens.primaryColor,
              }}
            >
              5 Dimensiones
            </span>
          </div>

          <div className="h-64 min-h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarMetrics.map((m) => ({ ...m }))}>
                <PolarGrid
                  stroke={
                    isDarkTheme
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(49,47,48,0.18)'
                  }
                />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{
                    fill: themeTokens.textColor,
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: themeTokens.textColor, fontSize: 9 }}
                />
                <Radar
                  name="Puntaje"
                  dataKey="score"
                  stroke={themeTokens.primaryColor}
                  fill={themeTokens.primaryColor}
                  fillOpacity={0.45}
                  strokeWidth={2.5}
                />
                <Tooltip contentStyle={tooltipContentStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </BentoSpringCard>

        {/* Module 5: Dial de Sincronización y Distribución de Estados (Donut Chart) */}
        <BentoSpringCard
          className="p-6 sm:p-8 rounded-3xl shadow-tactile border-2 flex flex-col justify-between print-break-avoid"
          style={cardSurfaceStyle}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <Clock
                className="w-5 h-5"
                style={{ color: themeTokens.primaryColor }}
              />
              Dial de Sincronización de Estados
            </h3>
            <span
              className="text-xs font-black px-3 py-1 rounded-xl"
              style={{
                backgroundColor: `${themeTokens.goldColor}30`,
                color: themeTokens.textColor,
              }}
            >
              Eficiencia: {efficiencyScore}%
            </span>
          </div>

          <div className="h-64 min-h-[260px] w-full flex items-center justify-center relative">
            {statusPieData.length > 0 && statusPieData.some((s) => s.value > 0) ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData.map((s) => ({ ...s }))}
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipContentStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black">{efficiencyScore}%</span>
                  <span className="text-[10px] font-bold uppercase opacity-65">
                    Productividad
                  </span>
                </div>
              </>
            ) : (
              <div className="text-xs opacity-65">
                Aún no hay suficientes métricas registradas.
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
            {statusPieData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs font-bold">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span>
                  {s.name} ({s.value})
                </span>
              </div>
            ))}
          </div>
        </BentoSpringCard>

        {/* Module 6: Avance de Proyectos / Contribución de Equipo */}
        <BentoSpringCard
          className="p-6 sm:p-8 rounded-3xl shadow-tactile border-2 flex flex-col justify-between print-break-avoid"
          style={cardSurfaceStyle}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              {scope === 'GLOBAL' ? (
                <>
                  <FolderKanban
                    className="w-5 h-5"
                    style={{ color: themeTokens.accentColor }}
                  />
                  Avance de Proyectos
                </>
              ) : (
                <>
                  <Users
                    className="w-5 h-5"
                    style={{ color: themeTokens.primaryColor }}
                  />
                  Contribución del Equipo
                </>
              )}
            </h3>
            {scope === 'GLOBAL' && (
              <span
                className="text-xs font-black"
                style={{ color: themeTokens.primaryColor }}
              >
                Top: {projectComparison.topProjectName}
              </span>
            )}
          </div>

          <div className="h-64 min-h-[260px] overflow-y-auto space-y-3 pr-1">
            {scope === 'GLOBAL' ? (
              projectComparison.projects.length > 0 ? (
                projectComparison.projects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => handleProjectSelect(proj.id)}
                    style={{
                      backgroundColor: isDarkTheme
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(197,212,202,0.2)',
                      borderColor: `${themeTokens.primaryColor}30`,
                    }}
                    className="p-3 rounded-2xl border hover:opacity-90 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{proj.icon}</span>
                        <span className="text-xs font-black">{proj.name}</span>
                      </div>
                      <span
                        className="text-xs font-black"
                        style={{ color: themeTokens.primaryColor }}
                      >
                        {proj.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/15 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${proj.progressPercent}%`,
                          backgroundColor: proj.colorHex || themeTokens.primaryColor,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs opacity-65 py-12 text-center">
                  No hay proyectos activos.
                </div>
              )
            ) : projectReport?.teamContributions &&
              projectReport.teamContributions.length > 0 ? (
              projectReport.teamContributions.map((member) => {
                const contributionPct =
                  member.contributionPercentage ?? member.percentageOfTeam ?? 0;

                return (
                  <div
                    key={member.userId}
                    style={{
                      backgroundColor: isDarkTheme
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(197,212,202,0.2)',
                      borderColor: `${themeTokens.primaryColor}30`,
                    }}
                    className="p-3 rounded-2xl border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                          style={{
                            backgroundColor: `${themeTokens.primaryColor}35`,
                          }}
                        >
                          {(member.username || 'U').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-black">{member.username}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-black/75 text-white uppercase">
                          {member.role}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className="text-xs font-black"
                        style={{ color: themeTokens.primaryColor }}
                      >
                        +{member.xpContributed} XP
                      </p>
                      <p className="text-[11px] opacity-75 font-bold">
                        {member.completedCount} tareas ({contributionPct}%)
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs opacity-65 py-12 text-center">
                Sin colaboradores en este proyecto.
              </div>
            )}
          </div>
        </BentoSpringCard>
      </div>

      {/* Module 7: Explorador Visual de Progreso por Cada Acción */}
      <div
        style={cardSurfaceStyle}
        className="p-6 sm:p-8 rounded-3xl shadow-tactile border-2 space-y-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5" style={{ color: themeTokens.goldColor }} />
              Explorador Visual de Progreso por Cada Acción
            </h3>
            <p className="text-xs opacity-75">
              Inspección detallada de tareas individuales y hábitos con desglose de ejecuciones y XP acumulada.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap no-print">
            <div className="relative">
              <Search className="w-3.5 h-3.5 opacity-60 absolute left-3 top-2.5" />
              <input
                type="text"
                value={actionSearch}
                onChange={(e) => setActionSearch(e.target.value)}
                placeholder="Filtrar acción..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-black/5 border border-black/15 text-xs font-medium focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 bg-black/10 p-1 rounded-xl">
              {(['ALL', 'SINGLE', 'RECURRING'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActionFilter(f)}
                  style={
                    actionFilter === f
                      ? { backgroundColor: themeTokens.primaryColor, color: '#FFFFFF' }
                      : undefined
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    actionFilter === f ? 'shadow-sm' : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  {f === 'ALL' ? 'Todas' : f === 'SINGLE' ? 'Únicas ⚡' : 'Recurrentes 🔄'}
                </button>
              ))}
            </div>

            <select
              value={actionSort}
              onChange={(e) => setActionSort(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-black/10 border border-black/15 text-xs font-bold focus:outline-none"
            >
              <option value="progressPercent" className="text-slate-900">
                Ordenar por % Avance
              </option>
              <option value="totalExecutions" className="text-slate-900">
                Ordenar por Ejecuciones
              </option>
              <option value="xpGenerated" className="text-slate-900">
                Ordenar por XP Generada
              </option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeActionProgressList.length > 0 ? (
            activeActionProgressList.map((action) => (
              <div
                key={action.id}
                style={{
                  backgroundColor: isDarkTheme
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(197,212,202,0.18)',
                  borderColor: `${themeTokens.primaryColor}30`,
                }}
                className="p-4 rounded-2xl border flex flex-col justify-between space-y-3 print-break-avoid"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-black/80 text-white">
                      {action.type === 'RECURRING' ? 'Hábito' : 'Tarea'}
                    </span>
                    <span className="text-[10px] font-bold opacity-70 uppercase">
                      {action.priority}
                    </span>
                  </div>
                  <h4 className="text-sm font-black line-clamp-1">{action.title}</h4>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="opacity-75">Progreso</span>
                    <span style={{ color: themeTokens.primaryColor }}>
                      {action.progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/15 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${action.progressPercent}%`,
                        backgroundColor: themeTokens.primaryColor,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/10 text-xs font-black">
                  <span
                    className="flex items-center gap-1"
                    style={{ color: themeTokens.accentColor }}
                  >
                    <Repeat className="w-3.5 h-3.5" /> {action.totalExecutions} ciclos
                  </span>
                  <span
                    className="flex items-center gap-1"
                    style={{ color: themeTokens.goldColor }}
                  >
                    <Award className="w-3.5 h-3.5" /> +{action.xpGenerated} XP
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-xs opacity-65">
              No hay acciones que coincidan con el filtro actual.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ReportsPage: React.FC = () => {
  return (
    <ReportsErrorBoundary>
      <ReportsPageContent />
    </ReportsErrorBoundary>
  );
};
