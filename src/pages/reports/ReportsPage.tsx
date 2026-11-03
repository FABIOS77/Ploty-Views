import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchDashboardReport } from '../../store/slices/reportsSlice';
import { springConfig } from '../../common/motion/motion-skills';

export const ReportsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dashboard } = useAppSelector((state) => state.reports);

  useEffect(() => {
    dispatch(fetchDashboardReport(14));
  }, [dispatch]);

  const summary = dashboard?.summary || {
    totalActivities: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0,
    completionRate: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig.tactile}
        className="bg-ploty-charcoal text-ploty-white p-6 sm:p-8 rounded-3xl shadow-tactile flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-ploty-periwinkle/20 border border-ploty-periwinkle/40 text-ploty-periwinkle text-xs font-black uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Métricas & Visual Analytics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Dashboard de Rendimiento Bento
          </h2>
          <p className="text-sm text-ploty-sage/80 max-w-xl">
            Monitorea el ratio de resolución de tareas, cumplimiento de hábitos y distribución de prioridades.
          </p>
        </div>
      </motion.div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-ploty-white text-ploty-charcoal shadow-tactile border border-ploty-charcoal/10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-ploty-sage/30 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-ploty-charcoal" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-ploty-charcoal/60">
              Tasa de Éxito
            </p>
            <p className="text-2xl font-black text-ploty-periwinkle">
              {summary.completionRate}%
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-ploty-white text-ploty-charcoal shadow-tactile border border-ploty-charcoal/10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-ploty-coral/20 flex items-center justify-center text-ploty-coral">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-ploty-charcoal/60">
              Completadas
            </p>
            <p className="text-2xl font-black">{summary.completed}</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-ploty-white text-ploty-charcoal shadow-tactile border border-ploty-charcoal/10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-ploty-gold/20 flex items-center justify-center text-ploty-gold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-ploty-charcoal/60">
              Pendientes
            </p>
            <p className="text-2xl font-black">{summary.pending}</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-ploty-white text-ploty-charcoal shadow-tactile border border-ploty-charcoal/10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-ploty-coral/20 flex items-center justify-center text-ploty-coral">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-ploty-charcoal/60">
              Vencidas
            </p>
            <p className="text-2xl font-black text-ploty-coral">{summary.overdue}</p>
          </div>
        </div>
      </div>

      {/* Visual Distribution Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-ploty-white text-ploty-charcoal p-6 sm:p-8 rounded-3xl shadow-tactile border border-ploty-charcoal/10 space-y-4">
          <h3 className="font-black text-base flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-ploty-periwinkle" />
            Distribución por Estado
          </h3>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Completadas ({summary.completed})</span>
                <span>{summary.completionRate}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-ploty-sage/30 overflow-hidden">
                <div
                  className="h-full bg-ploty-coral rounded-full transition-all"
                  style={{ width: `${summary.completionRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Pendientes ({summary.pending})</span>
                <span>
                  {summary.totalActivities
                    ? Math.round((summary.pending / summary.totalActivities) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-ploty-sage/30 overflow-hidden">
                <div
                  className="h-full bg-ploty-gold rounded-full transition-all"
                  style={{
                    width: `${
                      summary.totalActivities
                        ? Math.round((summary.pending / summary.totalActivities) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Vencidas ({summary.overdue})</span>
                <span>
                  {summary.totalActivities
                    ? Math.round((summary.overdue / summary.totalActivities) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-ploty-sage/30 overflow-hidden">
                <div
                  className="h-full bg-ploty-charcoal rounded-full transition-all"
                  style={{
                    width: `${
                      summary.totalActivities
                        ? Math.round((summary.overdue / summary.totalActivities) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Daily Trends & Velocity */}
        <div className="bg-ploty-white text-ploty-charcoal p-6 sm:p-8 rounded-3xl shadow-tactile border border-ploty-charcoal/10 space-y-4">
          <h3 className="font-black text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-ploty-gold" />
            Tendencias de Rendimiento (14 Días)
          </h3>

          <p className="text-xs text-ploty-charcoal/70 leading-relaxed">
            Las transformaciones de métricas se ejecutan inmutablemente en el pipeline funcional del backend y frontend de Ploty.
          </p>

          <div className="p-4 rounded-2xl bg-ploty-sage/20 border border-ploty-charcoal/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Total Actividades Registradas:</span>
              <span className="font-black text-ploty-periwinkle">
                {summary.totalActivities}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Ratio de Finalización Global:</span>
              <span className="font-black text-ploty-coral">
                {summary.completionRate}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Paleta Nivel 0 Activa:</span>
              <span className="font-black text-ploty-charcoal">Tactile Bento</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
