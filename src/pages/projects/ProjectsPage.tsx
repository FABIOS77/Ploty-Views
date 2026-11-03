import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban,
  Plus,
  Users,
  CheckCircle2,
  Sparkles,
  X,
  Palette,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchProjects,
  createProject,
  setSelectedProject,
} from '../../store/slices/projectsSlice';
import { BentoSpringCard } from '../../common/motion/BentoSpringCard';
import { StaggerContainer, StaggerItem } from '../../common/motion/StaggerList';
import { springConfig } from '../../common/motion/motion-skills';
import { ProjectDetailModal } from './ProjectDetailModal';

const COLOR_PRESETS = [
  '#7477FF', // Periwinkle
  '#F66554', // Coral
  '#F9CD61', // Gold
  '#312F30', // Charcoal
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#EC4899', // Pink
];

const ICON_PRESETS = ['🚀', '🎯', '⚡', '🔥', '💡', '💎', '🛡️', '📦'];

export const ProjectsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { projects, loading, selectedProject } = useAppSelector(
    (state) => state.projects,
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorHex, setColorHex] = useState(COLOR_PRESETS[0]);
  const [icon, setIcon] = useState(ICON_PRESETS[0]);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await dispatch(
      createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        colorHex,
        icon,
      }),
    );

    setName('');
    setDescription('');
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bento Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig.tactile}
        className="bg-ploty-charcoal text-ploty-white p-6 sm:p-8 rounded-3xl shadow-tactile flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-ploty-periwinkle/20 border border-ploty-periwinkle/40 text-ploty-periwinkle text-xs font-black uppercase tracking-wider">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Módulo de Proyectos</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Proyectos Colaborativos Bento
          </h2>
          <p className="text-sm text-ploty-sage/80">
            Organiza tus actividades grupales, asigna roles de equipo y monitoriza el progreso global.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-ploty-periwinkle hover:bg-ploty-periwinkle/90 text-ploty-white font-black text-sm shadow-tactile-sm transition-all flex-shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proyecto</span>
        </motion.button>
      </motion.div>

      {/* Projects Grid */}
      {loading && projects.length === 0 ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-ploty-periwinkle border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-ploty-white text-ploty-charcoal p-12 rounded-3xl shadow-tactile text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-ploty-sage/30 flex items-center justify-center mx-auto text-3xl">
            🚀
          </div>
          <h3 className="text-lg font-black">Aún no tienes proyectos creados</h3>
          <p className="text-xs text-ploty-charcoal/70 max-w-md mx-auto">
            Crea tu primer proyecto para agrupar actividades, invitar colaboradores y ganar multiplicadores de XP grupal.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-ploty-periwinkle text-ploty-white text-xs font-black shadow-sm"
          >
            Crear Primer Proyecto
          </button>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const progress = project.summary?.progressPercent ?? 0;
            return (
              <StaggerItem key={project.id}>
                <BentoSpringCard
                  onClick={() => dispatch(setSelectedProject(project))}
                  className="bg-ploty-white text-ploty-charcoal p-6 rounded-3xl shadow-tactile border-2 border-ploty-charcoal/10 hover:border-ploty-periwinkle flex flex-col justify-between h-full group"
                >
                  <div className="space-y-4">
                    {/* Card Header with Color Accent & Icon */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-ploty-charcoal/10"
                          style={{ backgroundColor: `${project.colorHex}25` }}
                        >
                          {project.icon || '🚀'}
                        </div>
                        <div>
                          <h4 className="font-black text-base group-hover:text-ploty-periwinkle transition-colors line-clamp-1">
                            {project.name}
                          </h4>
                          <span className="text-[11px] font-bold text-ploty-charcoal/60 uppercase tracking-wider">
                            {project._count?.activities ?? project.summary?.total ?? 0} Actividades
                          </span>
                        </div>
                      </div>

                      <div
                        className="w-3.5 h-3.5 rounded-full border border-ploty-charcoal/20"
                        style={{ backgroundColor: project.colorHex }}
                        title="Color del proyecto"
                      />
                    </div>

                    <p className="text-xs text-ploty-charcoal/70 line-clamp-2 leading-relaxed min-h-[36px]">
                      {project.description || 'Sin descripción detallada.'}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between items-center text-[11px] font-black">
                        <span className="flex items-center gap-1 text-ploty-charcoal/70">
                          <CheckCircle2 className="w-3.5 h-3.5 text-ploty-coral" />
                          Progreso
                        </span>
                        <span className="text-ploty-periwinkle">{progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-ploty-sage/40 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: project.colorHex || '#7477FF' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Members Avatars */}
                  <div className="mt-5 pt-4 border-t border-ploty-charcoal/10 flex items-center justify-between">
                    <div className="flex items-center -space-x-2">
                      {project.members && project.members.length > 0 ? (
                        project.members.slice(0, 4).map((member) => (
                          <div
                            key={member.id}
                            className="w-7 h-7 rounded-full border-2 border-ploty-white bg-ploty-periwinkle/30 flex items-center justify-center text-[10px] font-black text-ploty-charcoal overflow-hidden shadow-sm"
                            title={member.user.username}
                          >
                            {member.user.avatarUrl ? (
                              <img
                                src={member.user.avatarUrl}
                                alt={member.user.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              member.user.username.slice(0, 2).toUpperCase()
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-ploty-white bg-ploty-sage/40 flex items-center justify-center text-xs">
                          <Users className="w-3.5 h-3.5 text-ploty-charcoal/60" />
                        </div>
                      )}
                      {(project.members?.length || 0) > 4 && (
                        <span className="text-[10px] font-black pl-3 text-ploty-charcoal/60">
                          +{(project.members?.length || 0) - 4}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-black text-ploty-periwinkle group-hover:underline flex items-center gap-1">
                      Ver Detalles &rarr;
                    </span>
                  </div>
                </BentoSpringCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}

      {/* New Project Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ploty-charcoal/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={springConfig.tactile}
              className="bg-ploty-white text-ploty-charcoal w-full max-w-lg rounded-3xl shadow-tactile p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-ploty-periwinkle/20 text-ploty-periwinkle flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black">Crear Nuevo Proyecto</h3>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-ploty-sage/30 text-ploty-charcoal/60"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal mb-1.5">
                    Nombre del Proyecto *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ej. Sprint de Funcionalidades"
                    className="w-full px-4 py-2.5 rounded-2xl bg-ploty-sage/20 border-2 border-ploty-charcoal/10 focus:border-ploty-periwinkle focus:outline-none text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal mb-1.5">
                    Descripción
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Objetivo y alcances del proyecto..."
                    className="w-full px-4 py-2 rounded-2xl bg-ploty-sage/20 border-2 border-ploty-charcoal/10 focus:border-ploty-periwinkle focus:outline-none text-xs font-medium resize-none"
                  />
                </div>

                {/* Icon Selector */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal mb-1.5">
                    Ícono del Proyecto
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {ICON_PRESETS.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setIcon(ic)}
                        className={`w-10 h-10 rounded-2xl text-xl flex items-center justify-center border-2 transition-all ${
                          icon === ic
                            ? 'border-ploty-periwinkle bg-ploty-periwinkle/15 scale-110 shadow-sm'
                            : 'border-ploty-charcoal/10 hover:border-ploty-charcoal/30'
                        }`}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selector */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal mb-1.5 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-ploty-coral" />
                    Color de Identidad
                  </label>
                  <div className="flex gap-2.5 flex-wrap">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setColorHex(color)}
                        style={{ backgroundColor: color }}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                          colorHex === color
                            ? 'border-ploty-charcoal scale-125 shadow-tactile-sm'
                            : 'border-ploty-white hover:scale-110'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2.5 rounded-2xl border-2 border-ploty-charcoal/10 font-bold text-xs hover:bg-ploty-sage/20"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-ploty-periwinkle text-ploty-white font-black text-xs shadow-tactile-sm hover:opacity-90"
                  >
                    Guardar Proyecto
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Selected Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          isOpen={Boolean(selectedProject)}
          onClose={() => dispatch(setSelectedProject(null))}
        />
      )}
    </div>
  );
};
