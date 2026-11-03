import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
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
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchDashboardReport,
  fetchProjectReport,
  setDaysRange,
  setSelectedProjectId,
} from '../../store/slices/reportsSlice';
import { fetchProjects } from '../../store/slices/projectsSlice';
import {
  transformDailyTrendForChart,
  calculateEfficiencyScore,
  filterAndSortActionProgress,
  computeProjectComparisonMatrix,
} from '../../common/fp/chart-transformers.fp';
import { BentoSpringCard } from '../../common/motion/BentoSpringCard';
import { springConfig } from '../../common/motion/motion-skills';

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#F66554', // Coral
  IN_PROGRESS: '#7477FF', // Periwinkle
  PENDING: '#F9CD61', // Gold
  OVERDUE: '#312F30', // Charcoal
};

export const ReportsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dashboard, projectReport, selectedDaysRange, selectedProjectId } =
    useAppSelector((state) => state.reports);
  const projects = useAppSelector((state) => state.projects.projects);

  const [scope, setScope] = useState<'GLOBAL' | 'PROJECT'>('GLOBAL');
  const [actionFilter, setActionFilter] = useState<'ALL' | 'SINGLE' | 'RECURRING'>('ALL');
  const [actionSearch, setActionSearch] = useState('');
  const [actionSort, setActionSort] = useState<'progressPercent' | 'totalExecutions' | 'xpGenerated'>('progressPercent');

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

  // Determine active dataset based on scope
  const activeDailyTrend = useMemo(() => {
    const raw = scope === 'GLOBAL' ? dashboard?.dailyTrend : projectReport?.dailyTrend;
    return transformDailyTrendForChart(raw || []);
  }, [scope, dashboard?.dailyTrend, projectReport?.dailyTrend]);

  const efficiencyScore = useMemo(() => {
    return calculateEfficiencyScore(
      dashboard?.overview,
      dashboard?.recurrenceVsSingle,
    );
  }, [dashboard?.overview, dashboard?.recurrenceVsSingle]);

  const activeActionProgressList = useMemo(() => {
    const raw = scope === 'GLOBAL'
      ? dashboard?.actionProgressList
      : projectReport?.actionProgress;
    return filterAndSortActionProgress(raw || [], actionFilter, actionSearch, actionSort);
  }, [scope, dashboard?.actionProgressList, projectReport?.actionProgress, actionFilter, actionSearch, actionSort]);

  const projectComparison = useMemo(() => {
    return computeProjectComparisonMatrix(dashboard?.projectsProgress || []);
  }, [dashboard?.projectsProgress]);

  // Priority breakdown formatted for recharts
  const priorityChartData = useMemo(() => {
    const breakdown = scope === 'GLOBAL'
      ? dashboard?.priorityBreakdown
      : projectReport?.priorityBreakdown;

    if (!breakdown) return [];

    return Object.keys(breakdown).map((key) => {
      const data = breakdown[key] || { total: 0, completed: 0 };
      return {
        priority: key,
        Total: data.total || 0,
        Completadas: data.completed || 0,
      };
    });
  }, [scope, dashboard?.priorityBreakdown, projectReport?.priorityBreakdown]);

  // Status distribution formatted for recharts
  const statusPieData = useMemo(() => {
    const dist = scope === 'GLOBAL'
      ? dashboard?.statusDistribution
      : projectReport?.statusDistribution;

    if (!dist) return [];

    return Object.entries(dist).map(([status, count]) => ({
      name: status,
      value: count,
      color: STATUS_COLORS[status] || '#7477FF',
    }));
  }, [scope, dashboard?.statusDistribution, projectReport?.statusDistribution]);

  return (
    <div className="space-y-6">
      {/* Scope Selector & Range Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig.tactile}
        className="bg-ploty-charcoal text-ploty-white p-6 sm:p-8 rounded-3xl shadow-tactile flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-ploty-periwinkle/20 border border-ploty-periwinkle/40 text-ploty-periwinkle text-xs font-black uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Módulo de Métricas & Visual Analytics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Dashboard de Rendimiento Bento
          </h2>
          <p className="text-sm text-ploty-sage/80 max-w-xl">
            Gráficas táctiles interactivas para visualizar el cumplimiento de actividades, proyectos y hábitos.
          </p>
        </div>

        {/* Global vs Project Scope Switcher */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 bg-ploty-white/10 p-1.5 rounded-2xl border border-ploty-white/10">
            <button
              onClick={() => handleScopeChange('GLOBAL')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                scope === 'GLOBAL'
                  ? 'bg-ploty-periwinkle text-ploty-white shadow-sm'
                  : 'text-ploty-white/70 hover:text-ploty-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Panorama Global</span>
            </button>
            <button
              onClick={() => handleScopeChange('PROJECT')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                scope === 'PROJECT'
                  ? 'bg-ploty-periwinkle text-ploty-white shadow-sm'
                  : 'text-ploty-white/70 hover:text-ploty-white'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Por Proyecto</span>
            </button>
          </div>

          {/* Days Range or Project Selector */}
          {scope === 'GLOBAL' ? (
            <div className="flex items-center gap-1 bg-ploty-white/10 p-1 rounded-2xl border border-ploty-white/10">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => dispatch(setDaysRange(days))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    selectedDaysRange === days
                      ? 'bg-ploty-coral text-ploty-white shadow-sm'
                      : 'text-ploty-white/70 hover:text-ploty-white'
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
              className="px-3.5 py-2.5 rounded-2xl bg-ploty-white/10 border border-ploty-white/20 text-xs font-bold text-ploty-white focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="text-ploty-charcoal">
                  {p.icon} {p.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </motion.div>

      {/* Top Quick Metric Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-ploty-white text-ploty-charcoal shadow-tactile border border-ploty-charcoal/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-ploty-periwinkle/20 text-ploty-periwinkle flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase text-ploty-charcoal/60">
              Índice de Eficiencia
            </p>
            <p className="text-xl font-black text-ploty-periwinkle">{efficiencyScore}%</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-ploty-white text-ploty-charcoal shadow-tactile border border-ploty-charcoal/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-ploty-coral/20 text-ploty-coral flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase text-ploty-charcoal/60">
              Cumplimiento
            </p>
            <p className="text-xl font-black text-ploty-coral">
              {scope === 'GLOBAL'
                ? dashboard?.overview.completionRate ?? 0
                : projectReport?.project.progressPercent ?? 0}
              %
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-ploty-white text-ploty-charcoal shadow-tactile border border-ploty-charcoal/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-ploty-gold/20 text-ploty-gold flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase text-ploty-charcoal/60">
              XP Total Ganada
            </p>
            <p className="text-xl font-black">{dashboard?.overview.xp ?? 0}</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-ploty-white text-ploty-charcoal shadow-tactile border border-ploty-charcoal/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-ploty-coral/20 text-ploty-coral flex items-center justify-center">
            <Flame className="w-5 h-5 fill-ploty-coral" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase text-ploty-charcoal/60">
              Racha Activa
            </p>
            <p className="text-xl font-black">{dashboard?.overview.currentStreak ?? 0} días</p>
          </div>
        </div>
      </div>

      {/* Main 5 Bento Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Capacidad y Tendencia de XP & Cumplimiento (AreaChart) */}
        <BentoSpringCard className="p-6 sm:p-8 rounded-3xl shadow-tactile bg-ploty-periwinkle text-ploty-white flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-ploty-white" />
              <h3 className="text-lg font-black tracking-tight">
                Capacidad y Tendencia de XP
              </h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-ploty-white/20">
              {selectedDaysRange} Días
            </span>
          </div>

          <div className="h-64 w-full">
            {activeDailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[...activeDailyTrend]}>
                  <defs>
                    <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="shortDate"
                    stroke="#FFFFFF"
                    tick={{ fill: '#FFFFFF', fontSize: 11, fontWeight: 700 }}
                  />
                  <YAxis
                    stroke="#FFFFFF"
                    tick={{ fill: '#FFFFFF', fontSize: 11, fontWeight: 700 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#312F30',
                      borderRadius: '16px',
                      color: '#FFFFFF',
                      border: '2px solid #FFFFFF',
                      fontWeight: 'bold',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="xpGained"
                    stroke="#FFFFFF"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#xpGradient)"
                    name="XP Ganada"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-ploty-white/70">
                Sin registros de actividad en este periodo.
              </div>
            )}
          </div>
        </BentoSpringCard>

        {/* Module 2: Rendimiento por Prioridad y Hábitos (BarChart) */}
        <BentoSpringCard className="p-6 sm:p-8 rounded-3xl shadow-tactile bg-ploty-coral text-ploty-white flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-ploty-white" />
              <h3 className="text-lg font-black tracking-tight">
                Rendimiento por Prioridad
              </h3>
            </div>

            {/* Recurrence vs Single Quick Badge */}
            {dashboard?.recurrenceVsSingle && (
              <div className="flex items-center gap-2 text-xs font-black">
                <span className="bg-ploty-white/20 px-2.5 py-1 rounded-xl">
                  ⚡ Únicas: {dashboard.recurrenceVsSingle.single?.completed ?? 0}
                </span>
                <span className="bg-ploty-white/20 px-2.5 py-1 rounded-xl">
                  🔄 Hábitos: {dashboard.recurrenceVsSingle.recurring?.totalExecutions ?? 0}
                </span>
              </div>
            )}
          </div>

          <div className="h-64 w-full">
            {priorityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData}>
                  <XAxis
                    dataKey="priority"
                    stroke="#FFFFFF"
                    tick={{ fill: '#FFFFFF', fontSize: 11, fontWeight: 700 }}
                  />
                  <YAxis
                    stroke="#FFFFFF"
                    tick={{ fill: '#FFFFFF', fontSize: 11, fontWeight: 700 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#312F30',
                      borderRadius: '16px',
                      color: '#FFFFFF',
                      border: '2px solid #FFFFFF',
                      fontWeight: 'bold',
                    }}
                  />
                  <Bar dataKey="Total" fill="#FFFFFF" opacity={0.4} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Completadas" fill="#FFFFFF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-ploty-white/70">
                Sin datos de prioridad.
              </div>
            )}
          </div>
        </BentoSpringCard>

        {/* Module 3: Dial de Sincronización y Distribución de Estados (Donut Chart) */}
        <BentoSpringCard className="p-6 sm:p-8 rounded-3xl shadow-tactile bg-ploty-white text-ploty-charcoal flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-ploty-periwinkle" />
              Dial de Sincronización de Estados
            </h3>
            <span className="text-xs font-black px-3 py-1 rounded-xl bg-ploty-sage/30 text-ploty-charcoal">
              Eficiencia: {efficiencyScore}%
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center relative">
            {statusPieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center score */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black">{efficiencyScore}%</span>
                  <span className="text-[10px] font-bold uppercase text-ploty-charcoal/60">
                    Productividad
                  </span>
                </div>
              </>
            ) : (
              <div className="text-xs text-ploty-charcoal/60">Sin actividades registradas.</div>
            )}
          </div>

          {/* Legend */}
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

        {/* Module 4: Avance de Proyectos / Contribución de Equipo */}
        <BentoSpringCard className="p-6 sm:p-8 rounded-3xl shadow-tactile bg-ploty-white text-ploty-charcoal flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              {scope === 'GLOBAL' ? (
                <>
                  <FolderKanban className="w-5 h-5 text-ploty-coral" />
                  Avance de Proyectos
                </>
              ) : (
                <>
                  <Users className="w-5 h-5 text-ploty-periwinkle" />
                  Contribución del Equipo
                </>
              )}
            </h3>
            {scope === 'GLOBAL' && (
              <span className="text-xs font-black text-ploty-periwinkle">
                Top: {projectComparison.topProjectName}
              </span>
            )}
          </div>

          <div className="h-64 overflow-y-auto space-y-3 pr-1">
            {scope === 'GLOBAL' ? (
              projectComparison.projects.length > 0 ? (
                projectComparison.projects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => handleProjectSelect(proj.id)}
                    className="p-3 rounded-2xl bg-ploty-sage/15 border border-ploty-charcoal/10 hover:border-ploty-periwinkle transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{proj.icon}</span>
                        <span className="text-xs font-black">{proj.name}</span>
                      </div>
                      <span className="text-xs font-black text-ploty-periwinkle">
                        {proj.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-ploty-sage/40 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${proj.progressPercent}%`,
                          backgroundColor: proj.colorHex || '#7477FF',
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-ploty-charcoal/60 py-12 text-center">
                  No hay proyectos activos.
                </div>
              )
            ) : projectReport?.teamContributions && projectReport.teamContributions.length > 0 ? (
              projectReport.teamContributions.map((member) => (
                <div
                  key={member.userId}
                  className="p-3 rounded-2xl bg-ploty-sage/15 border border-ploty-charcoal/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-ploty-periwinkle/30 flex items-center justify-center text-xs font-black">
                        {member.username.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-black">{member.username}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-ploty-charcoal text-ploty-white uppercase">
                        {member.role}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-black text-ploty-periwinkle">
                      +{member.xpContributed} XP
                    </p>
                    <p className="text-[11px] text-ploty-charcoal/60 font-bold">
                      {member.completedCount} tareas ({member.percentageOfTeam}%)
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-ploty-charcoal/60 py-12 text-center">
                Sin colaboradores en este proyecto.
              </div>
            )}
          </div>
        </BentoSpringCard>
      </div>

      {/* Module 5: Explorador Visual de Progreso por Cada Acción (ActionProgressExplorer) */}
      <div className="bg-ploty-white text-ploty-charcoal p-6 sm:p-8 rounded-3xl shadow-tactile border border-ploty-charcoal/10 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-ploty-gold" />
              Explorador Visual de Progreso por Cada Acción
            </h3>
            <p className="text-xs text-ploty-charcoal/70">
              Inspección detallada de tareas individuales y hábitos con desglose de ejecuciones y XP acumulada.
            </p>
          </div>

          {/* Action Filters & Sort Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ploty-charcoal/50 absolute left-3 top-2.5" />
              <input
                type="text"
                value={actionSearch}
                onChange={(e) => setActionSearch(e.target.value)}
                placeholder="Filtrar acción..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-ploty-sage/20 border border-ploty-charcoal/10 text-xs font-medium focus:outline-none"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-ploty-sage/20 p-1 rounded-xl">
              {(['ALL', 'SINGLE', 'RECURRING'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActionFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                    actionFilter === f
                      ? 'bg-ploty-charcoal text-ploty-white shadow-sm'
                      : 'text-ploty-charcoal/70 hover:text-ploty-charcoal'
                  }`}
                >
                  {f === 'ALL' ? 'Todas' : f === 'SINGLE' ? 'Únicas ⚡' : 'Recurrentes 🔄'}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <select
              value={actionSort}
              onChange={(e) => setActionSort(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-ploty-sage/20 border border-ploty-charcoal/10 text-xs font-bold focus:outline-none"
            >
              <option value="progressPercent">Ordenar por % Avance</option>
              <option value="totalExecutions">Ordenar por Ejecuciones</option>
              <option value="xpGenerated">Ordenar por XP Generada</option>
            </select>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeActionProgressList.length > 0 ? (
            activeActionProgressList.map((action) => (
              <div
                key={action.id}
                className="p-4 rounded-2xl bg-ploty-sage/10 border border-ploty-charcoal/10 flex flex-col justify-between space-y-3 hover:border-ploty-periwinkle transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-ploty-charcoal text-ploty-white">
                      {action.type === 'RECURRING' ? 'Hábito' : 'Tarea'}
                    </span>
                    <span className="text-[10px] font-bold text-ploty-charcoal/60 uppercase">
                      {action.priority}
                    </span>
                  </div>

                  <h4 className="text-sm font-black line-clamp-1">{action.title}</h4>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-ploty-charcoal/70">Progreso</span>
                    <span className="text-ploty-periwinkle">{action.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-ploty-sage/30 overflow-hidden">
                    <div
                      className="h-full bg-ploty-periwinkle rounded-full transition-all"
                      style={{ width: `${action.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Badges */}
                <div className="flex items-center justify-between pt-2 border-t border-ploty-charcoal/10 text-xs font-black">
                  <span className="text-ploty-coral flex items-center gap-1">
                    <Repeat className="w-3.5 h-3.5" /> {action.totalExecutions} ciclos
                  </span>
                  <span className="text-ploty-gold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> +{action.xpGenerated} XP
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-xs text-ploty-charcoal/60">
              No hay acciones que coincidan con el filtro actual.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
