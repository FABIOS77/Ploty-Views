import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Plus,
  Repeat,
  Sparkles,
  Coins,
  Calendar,
  FolderKanban,
  CheckCircle2,
  Clock,
  X,
  Flame,
  Award,
  Pencil,
  Trash2,
  Play,
  AlertCircle,
  AlertTriangle,
  User as UserIcon,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  completeActivity,
  setFilters,
  clearActivitiesError,
  clearConflictNotice,
  selectFilteredActivitiesMemo,
  selectActivitiesSummaryMemo,
} from '../../store/slices/activitiesSlice';
import { syncUserStats } from '../../store/slices/authSlice';
import { queueRewardNotification } from '../../store/slices/gamificationSlice';
import { fetchProjects } from '../../store/slices/projectsSlice';
import type { ActivityItem } from '../../common/fp/activity-selectors.fp';
import { BentoSpringCard } from '../../common/motion/BentoSpringCard';
import { StaggerContainer, StaggerItem } from '../../common/motion/StaggerList';
import { triggerDopamineConfetti } from '../../common/motion/confetti';
import { springConfig } from '../../common/motion/motion-skills';
import { isErr, validateActivityForm, type FieldErrors } from '../../common/fp';

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: 'bg-ploty-coral/20', text: 'text-ploty-coral', border: 'border-ploty-coral/40' },
  HIGH: { bg: 'bg-ploty-gold/20', text: 'text-ploty-gold', border: 'border-ploty-gold/40' },
  MEDIUM: { bg: 'bg-ploty-periwinkle/20', text: 'text-ploty-periwinkle', border: 'border-ploty-periwinkle/40' },
  LOW: { bg: 'bg-ploty-sage/40', text: 'text-ploty-charcoal/70', border: 'border-ploty-charcoal/20' },
};

export const ActivitiesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activities, filters, loading, completingId, error, conflictNotice } =
    useAppSelector((state) => state.activities);
  const filteredActivities = useAppSelector(selectFilteredActivitiesMemo);
  const summary = useAppSelector(selectActivitiesSummaryMemo);
  const projects = useAppSelector((state) => state.projects.projects);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'SINGLE' | 'RECURRING'>('SINGLE');
  const [recurrence, setRecurrence] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM_DAYS'>('DAILY');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [projectId, setProjectId] = useState<string>('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [dueDateWarning, setDueDateWarning] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchActivities());
    dispatch(fetchProjects());
  }, [dispatch]);

  const selectedProjectMembers = useMemo(() => {
    if (!projectId) return [];
    const proj = projects.find((p) => p.id === projectId);
    return proj?.members ?? [];
  }, [projectId, projects]);

  const resetModal = () => {
    setEditingActivity(null);
    setTitle('');
    setDescription('');
    setType('SINGLE');
    setRecurrence('DAILY');
    setRecurrenceInterval(1);
    setPriority('MEDIUM');
    setProjectId('');
    setAssigneeId('');
    setDueDate('');
    setFieldErrors({});
    setDueDateWarning(null);
  };

  const openCreateModal = () => {
    resetModal();
    setIsModalOpen(true);
  };

  const openEditModal = (act: ActivityItem) => {
    setEditingActivity(act);
    setTitle(act.title);
    setDescription(act.description || '');
    setType(act.type);
    setRecurrence(
      act.recurrence && act.recurrence !== 'NONE' ? act.recurrence : 'DAILY',
    );
    setRecurrenceInterval(act.recurrenceInterval || 1);
    setPriority(act.priority);
    setProjectId(act.projectId || '');
    setAssigneeId(act.assigneeId || '');
    setDueDate(act.dueDate ? new Date(act.dueDate).toISOString().slice(0, 10) : '');
    setFieldErrors({});
    setDueDateWarning(null);
    setIsModalOpen(true);
  };

  // Handle completion with dopamine reward & 409 cooldown handling
  const handleComplete = async (act: ActivityItem) => {
    if (act.status === 'COMPLETED' || completingId === act.id) return;

    const resultAction = await dispatch(
      completeActivity({ id: act.id, title: act.title }),
    );

    if (completeActivity.fulfilled.match(resultAction)) {
      triggerDopamineConfetti();
      const reward =
        resultAction.payload.data.rewards || resultAction.payload.data.reward || {};

      dispatch(
        queueRewardNotification({
          title: act.title,
          xp: reward.xpGained ?? reward.xpEarned ?? act.xpReward ?? 50,
          coins: reward.coinsGained ?? reward.coinsEarned ?? act.coinReward ?? 25,
          leveledUp: Boolean(reward.leveledUp ?? resultAction.payload.data.levelUp),
          newLevel: reward.newLevel,
        }),
      );

      if (reward.newTotalXp !== undefined || reward.newCoins !== undefined) {
        dispatch(
          syncUserStats({
            xp: reward.newTotalXp,
            level: reward.newLevel,
            coins: reward.newCoins,
            currentStreak: reward.streakDays ?? reward.currentStreak,
          }),
        );
      }
    }
  };

  const handleSetInProgress = async (act: ActivityItem) => {
    await dispatch(
      updateActivity({
        id: act.id,
        data: { status: 'IN_PROGRESS' },
      }),
    );
  };

  const handleDelete = async (act: ActivityItem) => {
    if (confirm(`¿Seguro que deseas eliminar la actividad "${act.title}"?`)) {
      await dispatch(deleteActivity(act.id));
    }
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateActivityForm({
      title,
      description,
      type,
      recurrence: type === 'RECURRING' ? recurrence : 'NONE',
      recurrenceInterval: type === 'RECURRING' ? Number(recurrenceInterval) : 1,
      priority,
      dueDate: dueDate || undefined,
      projectId: projectId || undefined,
      assigneeId: assigneeId || undefined,
    });

    if (isErr(validation)) {
      setFieldErrors(validation.error);
      return;
    }

    setFieldErrors({});
    setDueDateWarning(validation.value.warnings[0] ?? null);

    if (editingActivity) {
      const res = await dispatch(
        updateActivity({
          id: editingActivity.id,
          data: {
            title: validation.value.title,
            description: validation.value.description,
            type: validation.value.type,
            recurrence:
              validation.value.type === 'RECURRING'
                ? validation.value.recurrence
                : 'NONE',
            recurrenceInterval:
              validation.value.type === 'RECURRING'
                ? validation.value.recurrenceInterval
                : 1,
            priority: validation.value.priority,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            assigneeId: assigneeId || undefined,
          },
        }),
      );
      if (updateActivity.fulfilled.match(res)) {
        resetModal();
        setIsModalOpen(false);
      }
    } else {
      const res = await dispatch(
        createActivity({
          title: validation.value.title,
          description: validation.value.description,
          type: validation.value.type,
          recurrence:
            validation.value.type === 'RECURRING'
              ? validation.value.recurrence
              : undefined,
          recurrenceInterval:
            validation.value.type === 'RECURRING'
              ? validation.value.recurrenceInterval
              : undefined,
          priority: validation.value.priority,
          projectId: projectId || undefined,
          assigneeId: assigneeId || undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        }),
      );
      if (createActivity.fulfilled.match(res)) {
        resetModal();
        setIsModalOpen(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bento Header with FP Summary */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig.tactile}
        className="bg-ploty-charcoal text-ploty-white p-6 sm:p-8 rounded-3xl shadow-tactile flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-ploty-periwinkle/20 border border-ploty-periwinkle/40 text-ploty-periwinkle text-xs font-black uppercase tracking-wider">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Motor de Actividades & Hábitos</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Actividades & Hábitos Recurrentes
          </h2>
          <p className="text-sm text-ploty-sage/80 max-w-xl">
            Gestiona el ciclo completo de tus tareas, asigna responsables de equipo y reclama recompensas dopamínicas en tiempo real.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-ploty-periwinkle hover:bg-ploty-periwinkle/90 text-ploty-white font-black text-sm shadow-tactile-sm transition-all flex-shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Actividad</span>
        </motion.button>
      </motion.div>

      {/* Friendly Recurring 409 Conflict Banner */}
      {conflictNotice && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-ploty-gold/25 border-2 border-ploty-gold text-ploty-charcoal flex items-center justify-between gap-3 text-xs font-black shadow-tactile-sm"
        >
          <div className="flex items-center gap-2.5">
            <Repeat className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{conflictNotice}</span>
          </div>
          <button
            onClick={() => dispatch(clearConflictNotice())}
            className="p-1 rounded-lg hover:bg-ploty-charcoal/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Backend Error Banner (activitiesSlice.error) */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-ploty-coral/15 border-2 border-ploty-coral/40 text-ploty-coral flex items-center justify-between gap-3 text-xs font-black"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => dispatch(clearActivitiesError())}
            className="p-1 rounded-lg hover:bg-ploty-coral/20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* FP Metric Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-ploty-white text-ploty-charcoal shadow-tactile border border-ploty-charcoal/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-ploty-sage/30 flex items-center justify-center text-ploty-charcoal">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-ploty-charcoal/60">
              Total
            </p>
            <p className="text-xl font-black">{summary.total}</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-ploty-white text-ploty-charcoal shadow-tactile border border-ploty-charcoal/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-ploty-coral/20 flex items-center justify-center text-ploty-coral">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-ploty-charcoal/60">
              Completadas
            </p>
            <p className="text-xl font-black text-ploty-coral">
              {summary.completed} ({summary.progressPercent}%)
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-ploty-white text-ploty-charcoal shadow-tactile border border-ploty-charcoal/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-ploty-gold/20 flex items-center justify-center text-ploty-gold">
            <Flame className="w-5 h-5 fill-ploty-gold/30" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-ploty-charcoal/60">
              Pendientes
            </p>
            <p className="text-xl font-black">{summary.pending}</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-ploty-white text-ploty-charcoal shadow-tactile border border-ploty-charcoal/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-ploty-periwinkle/20 flex items-center justify-center text-ploty-periwinkle">
            <Sparkles className="w-5 h-5 fill-ploty-periwinkle/30" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-ploty-charcoal/60">
              XP en Juego
            </p>
            <p className="text-xl font-black text-ploty-periwinkle">
              +{summary.totalXpAvailable}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bento Bar */}
      <div className="p-4 rounded-3xl bg-ploty-white shadow-tactile border border-ploty-charcoal/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-black uppercase tracking-wider text-ploty-charcoal/60 mr-2">
            Tipo:
          </span>
          {(['ALL', 'SINGLE', 'RECURRING'] as const).map((t) => (
            <button
              key={t}
              onClick={() => dispatch(setFilters({ type: t }))}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filters.type === t
                  ? 'bg-ploty-charcoal text-ploty-white shadow-sm'
                  : 'bg-ploty-sage/20 text-ploty-charcoal/70 hover:bg-ploty-sage/40'
              }`}
            >
              {t === 'ALL' ? 'Todos' : t === 'SINGLE' ? 'Únicas' : 'Recurrentes'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-black uppercase tracking-wider text-ploty-charcoal/60 mr-2">
            Prioridad:
          </span>
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
            <button
              key={p}
              onClick={() => dispatch(setFilters({ priority: p }))}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filters.priority === p
                  ? 'bg-ploty-periwinkle text-ploty-white shadow-sm'
                  : 'bg-ploty-sage/20 text-ploty-charcoal/70 hover:bg-ploty-sage/40'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {projects.length > 0 && (
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-ploty-charcoal/60" />
            <select
              value={filters.projectId || ''}
              onChange={(e) =>
                dispatch(setFilters({ projectId: e.target.value || undefined }))
              }
              className="px-3 py-1.5 rounded-xl bg-ploty-sage/20 border border-ploty-charcoal/10 text-xs font-bold focus:outline-none"
            >
              <option value="">Todos los Proyectos</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Activities Grid */}
      {loading && activities.length === 0 ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-ploty-periwinkle border-t-transparent" />
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="bg-ploty-white text-ploty-charcoal p-12 rounded-3xl shadow-tactile text-center space-y-3">
          <CheckSquare className="w-12 h-12 text-ploty-sage/80 mx-auto" />
          <h3 className="text-base font-black">No hay actividades con este filtro</h3>
          <p className="text-xs text-ploty-charcoal/60 max-w-sm mx-auto">
            Prueba cambiando los filtros seleccionados o añade una nueva tarea para comenzar a sumar XP.
          </p>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => {
            const isCompleted = act.status === 'COMPLETED';
            const isPending = act.status === 'PENDING';
            const isInProgress = act.status === 'IN_PROGRESS';
            const isRecurring = act.type === 'RECURRING';
            const priorityStyle = PRIORITY_COLORS[act.priority] || PRIORITY_COLORS.LOW;

            return (
              <StaggerItem key={act.id}>
                <BentoSpringCard
                  className={`p-6 rounded-3xl shadow-tactile border-2 flex flex-col justify-between h-full transition-all ${
                    isCompleted
                      ? 'bg-ploty-white/70 border-ploty-charcoal/10 opacity-75'
                      : isInProgress
                        ? 'bg-ploty-white border-ploty-periwinkle/60'
                        : 'bg-ploty-white border-ploty-charcoal/10 hover:border-ploty-periwinkle'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Priority, Type & CRUD Controls */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
                        >
                          {act.priority}
                        </span>

                        {isRecurring && (
                          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-ploty-coral/15 text-ploty-coral border border-ploty-coral/30">
                            <Repeat className="w-3 h-3" />
                            {act.recurrence}
                          </span>
                        )}

                        {isInProgress && (
                          <span className="text-[10px] font-black uppercase px-2 py-1 rounded-xl bg-ploty-periwinkle/20 text-ploty-periwinkle">
                            En progreso
                          </span>
                        )}
                      </div>

                      {/* Edit & Delete Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditModal(act)}
                          title="Editar actividad"
                          className="p-1.5 rounded-xl hover:bg-ploty-periwinkle/15 text-ploty-charcoal/60 hover:text-ploty-periwinkle transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(act)}
                          title="Eliminar actividad"
                          className="p-1.5 rounded-xl hover:bg-ploty-coral/15 text-ploty-charcoal/60 hover:text-ploty-coral transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Project & Assignee Tags */}
                    {(act.project || act.assignee) && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {act.project && (
                          <span
                            className="text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 border border-ploty-charcoal/10"
                            style={{ backgroundColor: `${act.project.colorHex}20` }}
                          >
                            <span>{act.project.icon}</span>
                            <span className="truncate max-w-[110px]">{act.project.name}</span>
                          </span>
                        )}
                        {act.assignee && (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-xl bg-ploty-sage/30 text-ploty-charcoal/80 flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            {act.assignee.username}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Title & Description */}
                    <div>
                      <h4
                        className={`text-base font-black leading-snug line-clamp-2 ${
                          isCompleted ? 'line-through text-ploty-charcoal/50' : 'text-ploty-charcoal'
                        }`}
                      >
                        {act.title}
                      </h4>
                      {act.description && (
                        <p className="text-xs text-ploty-charcoal/70 line-clamp-2 mt-1">
                          {act.description}
                        </p>
                      )}
                    </div>

                    {/* Due Date & Rewards */}
                    <div className="flex items-center justify-between gap-2 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs font-black text-ploty-periwinkle bg-ploty-periwinkle/15 px-2.5 py-1 rounded-xl">
                          <Sparkles className="w-3 h-3" /> +{act.xpReward} XP
                        </span>
                        <span className="flex items-center gap-1 text-xs font-black text-ploty-gold bg-ploty-gold/15 px-2.5 py-1 rounded-xl">
                          <Coins className="w-3 h-3" /> +{act.coinReward}
                        </span>
                      </div>

                      {act.dueDate && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-ploty-charcoal/60">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(act.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions: Set IN_PROGRESS + Complete */}
                  <div className="mt-5 pt-4 border-t border-ploty-charcoal/10 space-y-2">
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleSetInProgress(act)}
                        className="w-full py-2 px-3 rounded-2xl bg-ploty-periwinkle/15 hover:bg-ploty-periwinkle/25 text-ploty-periwinkle font-black text-[11px] tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Marcar En Progreso</span>
                      </button>
                    )}

                    <motion.button
                      whileHover={{ scale: isCompleted ? 1 : 1.02 }}
                      whileTap={{ scale: isCompleted ? 1 : 0.98 }}
                      onClick={() => handleComplete(act)}
                      disabled={isCompleted || completingId === act.id}
                      className={`w-full py-2.5 px-4 rounded-2xl font-black text-xs tracking-wider flex items-center justify-center gap-2 shadow-tactile-sm transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-ploty-coral/20 text-ploty-coral cursor-default'
                          : 'bg-ploty-charcoal hover:bg-ploty-periwinkle text-ploty-white'
                      }`}
                    >
                      {completingId === act.id ? (
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-ploty-white border-t-transparent" />
                      ) : isCompleted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-ploty-coral" />
                          <span>¡Completada con Éxito!</span>
                        </>
                      ) : (
                        <>
                          <Award className="w-4 h-4 text-ploty-gold" />
                          <span>Completar y Reclamar Recompensas</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </BentoSpringCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}

      {/* Create / Edit Activity Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ploty-charcoal/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={springConfig.tactile}
              className="bg-ploty-white text-ploty-charcoal w-full max-w-lg rounded-3xl shadow-tactile p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-ploty-coral/20 text-ploty-coral flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black">
                    {editingActivity ? 'Editar Actividad' : 'Crear Nueva Actividad'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    resetModal();
                    setIsModalOpen(false);
                  }}
                  className="p-1.5 rounded-xl hover:bg-ploty-sage/30 text-ploty-charcoal/60 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitModal} noValidate className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal mb-1">
                    Título de la Actividad *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: '' });
                    }}
                    placeholder="ej. Leer 30 minutos de documentación técnica"
                    className={`w-full px-4 py-2.5 rounded-2xl bg-ploty-sage/20 border-2 focus:outline-none text-xs font-medium ${
                      fieldErrors.title
                        ? 'border-ploty-coral'
                        : 'border-ploty-charcoal/10 focus:border-ploty-periwinkle'
                    }`}
                  />
                  {fieldErrors.title && (
                    <p className="mt-1 text-[11px] font-bold text-ploty-coral">
                      {fieldErrors.title}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal mb-1">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalles específicos..."
                    className="w-full px-4 py-2 rounded-2xl bg-ploty-sage/20 border-2 border-ploty-charcoal/10 focus:border-ploty-periwinkle focus:outline-none text-xs font-medium resize-none"
                  />
                </div>

                {/* Type: Single vs Recurring Toggle */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal mb-1.5">
                    Modalidad de la Actividad
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setType('SINGLE')}
                      className={`p-3 rounded-2xl border-2 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        type === 'SINGLE'
                          ? 'bg-ploty-charcoal text-ploty-white border-ploty-charcoal shadow-sm'
                          : 'bg-ploty-sage/20 text-ploty-charcoal/70 border-ploty-charcoal/10'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>Tarea Única</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setType('RECURRING')}
                      className={`p-3 rounded-2xl border-2 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        type === 'RECURRING'
                          ? 'bg-ploty-coral text-ploty-white border-ploty-coral shadow-sm'
                          : 'bg-ploty-sage/20 text-ploty-charcoal/70 border-ploty-charcoal/10'
                      }`}
                    >
                      <Repeat className="w-4 h-4" />
                      <span>Hábito Recurrente</span>
                    </button>
                  </div>
                </div>

                {/* Recurrence Sub-Options */}
                {type === 'RECURRING' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-2xl bg-ploty-coral/10 border border-ploty-coral/30 space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black uppercase text-ploty-coral mb-1">
                          Frecuencia de Ciclo
                        </label>
                        <select
                          value={recurrence}
                          onChange={(e) =>
                            setRecurrence(
                              e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM_DAYS',
                            )
                          }
                          className="w-full px-3 py-2 rounded-xl bg-ploty-white border border-ploty-coral/30 text-xs font-bold focus:outline-none"
                        >
                          <option value="DAILY">Diario</option>
                          <option value="WEEKLY">Semanal</option>
                          <option value="MONTHLY">Mensual</option>
                          <option value="CUSTOM_DAYS">Días Personalizados</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-ploty-coral mb-1">
                          Intervalo (1-365)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={365}
                          value={recurrenceInterval}
                          onChange={(e) => setRecurrenceInterval(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-ploty-white border border-ploty-coral/30 text-xs font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                    {fieldErrors.recurrenceInterval && (
                      <p className="text-[11px] font-bold text-ploty-coral">
                        {fieldErrors.recurrenceInterval}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Priority Selection */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal mb-1.5">
                    Prioridad & Multiplicador
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-2 rounded-xl text-[11px] font-black border-2 transition-all cursor-pointer ${
                          priority === p
                            ? 'bg-ploty-periwinkle text-ploty-white border-ploty-periwinkle shadow-sm'
                            : 'bg-ploty-sage/20 border-ploty-charcoal/10 text-ploty-charcoal/70'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project Selection & Due Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal mb-1">
                      Proyecto (Opcional)
                    </label>
                    <select
                      value={projectId}
                      disabled={Boolean(editingActivity)}
                      onChange={(e) => {
                        setProjectId(e.target.value);
                        setAssigneeId('');
                      }}
                      className="w-full px-3 py-2 rounded-2xl bg-ploty-sage/20 border-2 border-ploty-charcoal/10 text-xs font-bold focus:outline-none disabled:opacity-60"
                    >
                      <option value="">Sin Proyecto</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal mb-1">
                      Fecha Límite
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => {
                        setDueDate(e.target.value);
                        if (e.target.value) {
                          const d = new Date(e.target.value);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          setDueDateWarning(
                            d.getTime() < today.getTime()
                              ? 'La fecha límite está en el pasado (aparecerá como atrasada).'
                              : null,
                          );
                        } else {
                          setDueDateWarning(null);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-2xl bg-ploty-sage/20 border-2 border-ploty-charcoal/10 text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Non-blocking Past Due Date Warning */}
                {dueDateWarning && (
                  <div className="p-2.5 rounded-xl bg-ploty-gold/25 border border-ploty-gold text-amber-900 flex items-center gap-2 text-[11px] font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{dueDateWarning}</span>
                  </div>
                )}

                {/* Assignee Selector when project has members */}
                {selectedProjectMembers.length > 0 && (
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal mb-1">
                      Responsable del Equipo (Opcional)
                    </label>
                    <select
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="w-full px-3 py-2 rounded-2xl bg-ploty-sage/20 border-2 border-ploty-charcoal/10 text-xs font-bold focus:outline-none"
                    >
                      <option value="">Sin asignar específico</option>
                      {selectedProjectMembers.map((m) => {
                        const uid = m.user?.id || m.userId || '';
                        const uname = m.user?.username || 'Miembro';
                        return (
                          <option key={m.id} value={uid}>
                            {uname} ({m.role})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      resetModal();
                      setIsModalOpen(false);
                    }}
                    className="px-4 py-2.5 rounded-2xl border-2 border-ploty-charcoal/10 font-bold text-xs hover:bg-ploty-sage/20 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-ploty-periwinkle text-ploty-white font-black text-xs shadow-tactile-sm hover:opacity-90 cursor-pointer"
                  >
                    {editingActivity ? 'Guardar Cambios' : 'Guardar Actividad'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
