import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Users,
  User,
  UserPlus,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  Pencil,
  Save,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  type ProjectItem,
  addProjectMember,
  removeProjectMember,
  searchUsers,
  clearSearchResults,
  fetchProjectById,
  fetchProjects,
  updateProject,
  deleteProject,
} from '../../store/slices/projectsSlice';
import { springConfig } from '../../common/motion/motion-skills';
import { isErr, validateProjectForm, type FieldErrors } from '../../common/fp';

interface ProjectDetailModalProps {
  project: ProjectItem;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { searchResults, searchLoading } = useAppSelector((state) => state.projects);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');

  // Edit project state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [editDescription, setEditDescription] = useState(project.description || '');
  const [editIsTeam, setEditIsTeam] = useState(Boolean(project.isTeamProject));
  const [editErrors, setEditErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setEditName(project.name);
    setEditDescription(project.description || '');
    setEditIsTeam(Boolean(project.isTeamProject));
    setIsEditing(false);
    setEditErrors({});
  }, [project.id, project.name, project.description, project.isTeamProject]);

  if (!isOpen) return null;

  const ownerId = project.ownerId ?? project.creatorId;
  const isOwner = ownerId === currentUser?.id;
  const isOwnerOrAdmin =
    isOwner ||
    project.members?.some(
      (m) =>
        (m.user?.id || m.userId) === currentUser?.id &&
        (m.role === 'OWNER' || m.role === 'ADMIN'),
    );

  const summary = project.progressSummary ?? project.summary;
  const totalTasks = summary?.totalCount ?? summary?.total ?? 0;
  const completedTasks = summary?.completed ?? 0;
  const progressPercent = summary?.progressPercent ?? 0;
  const memberCount = project.memberCount ?? project.members?.length ?? 0;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length >= 2) {
      dispatch(searchUsers(q.trim()));
    } else {
      dispatch(clearSearchResults());
    }
  };

  const handleAddMember = async (userId: string) => {
    await dispatch(
      addProjectMember({
        projectId: project.id,
        userId,
        role: selectedRole,
      }),
    );
    setSearchQuery('');
    dispatch(clearSearchResults());
    dispatch(fetchProjectById(project.id));
    dispatch(fetchProjects());
  };

  const handleRemoveMember = async (userId: string) => {
    if (confirm('¿Seguro que deseas remover a este colaborador del proyecto?')) {
      await dispatch(
        removeProjectMember({
          projectId: project.id,
          userId,
        }),
      );
      dispatch(fetchProjectById(project.id));
      dispatch(fetchProjects());
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateProjectForm({
      name: editName,
      description: editDescription,
    });
    if (isErr(validation)) {
      setEditErrors(validation.error);
      return;
    }

    setEditErrors({});
    const res = await dispatch(
      updateProject({
        id: project.id,
        data: {
          name: validation.value.name,
          description: validation.value.description,
          isTeamProject: editIsTeam,
        },
      }),
    );
    if (updateProject.fulfilled.match(res)) {
      setIsEditing(false);
      dispatch(fetchProjects());
    }
  };

  const handleDeleteProject = async () => {
    if (
      confirm(
        `¿Seguro que deseas eliminar permanentemente el proyecto "${project.name}" y todas sus actividades asociadas?`,
      )
    ) {
      const res = await dispatch(deleteProject(project.id));
      if (deleteProject.fulfilled.match(res)) {
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ploty-charcoal/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={springConfig.tactile}
          className="bg-ploty-white text-ploty-charcoal w-full max-w-2xl rounded-3xl shadow-tactile overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div
            className="p-6 flex items-center justify-between text-ploty-white gap-3"
            style={{ backgroundColor: project.colorHex || '#312F30' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-3xl shrink-0">{project.icon || '🚀'}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-black truncate">{project.name}</h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-ploty-white/20">
                    {project.isTeamProject ? 'Equipo' : 'Individual'}
                  </span>
                </div>
                <p className="text-xs text-ploty-white/80 line-clamp-1">
                  {project.description || 'Sin descripción'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isOwnerOrAdmin && (
                <button
                  onClick={() => setIsEditing((prev) => !prev)}
                  title="Editar proyecto"
                  className="p-2 rounded-2xl bg-ploty-white/20 hover:bg-ploty-white/30 text-ploty-white transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              {isOwner && (
                <button
                  onClick={handleDeleteProject}
                  title="Eliminar proyecto"
                  className="p-2 rounded-2xl bg-ploty-coral/80 hover:bg-ploty-coral text-ploty-white transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-2xl bg-ploty-white/20 hover:bg-ploty-white/30 text-ploty-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            {/* Inline Edit Form (OWNER / ADMIN) */}
            {isEditing && isOwnerOrAdmin && (
              <form
                onSubmit={handleSaveEdit}
                noValidate
                className="p-4 rounded-2xl bg-ploty-sage/15 border-2 border-ploty-periwinkle/30 space-y-3"
              >
                <h4 className="text-xs font-black uppercase tracking-wider text-ploty-periwinkle">
                  Editar Proyecto
                </h4>
                <div>
                  <label className="block text-[11px] font-black uppercase text-ploty-charcoal mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-ploty-white border border-ploty-charcoal/15 text-xs font-bold focus:outline-none focus:border-ploty-periwinkle"
                  />
                  {editErrors.name && (
                    <p className="mt-1 text-[11px] font-bold text-ploty-coral">
                      {editErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-ploty-charcoal mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-ploty-white border border-ploty-charcoal/15 text-xs font-medium resize-none focus:outline-none focus:border-ploty-periwinkle"
                  />
                  {editErrors.description && (
                    <p className="mt-1 text-[11px] font-bold text-ploty-coral">
                      {editErrors.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditIsTeam(false)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer ${
                        !editIsTeam
                          ? 'bg-ploty-charcoal text-ploty-white'
                          : 'bg-ploty-white text-ploty-charcoal/70 border border-ploty-charcoal/15'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" /> Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditIsTeam(true)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer ${
                        editIsTeam
                          ? 'bg-ploty-periwinkle text-ploty-white'
                          : 'bg-ploty-white text-ploty-charcoal/70 border border-ploty-charcoal/15'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" /> En Equipo
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-ploty-charcoal/70 hover:bg-ploty-sage/30 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-ploty-periwinkle text-ploty-white text-xs font-black flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> Guardar
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Summary Metrics aligned with backend progressSummary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-ploty-sage/20 border border-ploty-charcoal/10 flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-ploty-charcoal/70" />
                <div>
                  <p className="text-[11px] font-bold text-ploty-charcoal/70">
                    Total Tareas
                  </p>
                  <p className="text-base font-black">{totalTasks}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-ploty-sage/20 border border-ploty-charcoal/10 flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-ploty-coral" />
                <div>
                  <p className="text-[11px] font-bold text-ploty-charcoal/70">
                    Completadas
                  </p>
                  <p className="text-base font-black">{completedTasks}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-ploty-sage/20 border border-ploty-charcoal/10 flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-ploty-periwinkle" />
                <div>
                  <p className="text-[11px] font-bold text-ploty-charcoal/70">
                    Progreso
                  </p>
                  <p className="text-base font-black">{progressPercent}%</p>
                </div>
              </div>
            </div>

            {/* Team Members Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-ploty-charcoal">
                  <Users className="w-4 h-4 text-ploty-periwinkle" />
                  <span>Equipo del Proyecto ({memberCount})</span>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {project.members && project.members.length > 0 ? (
                  project.members.map((member) => {
                    const username =
                      member.user?.username ?? (member as any).username ?? 'Usuario';
                    const email = member.user?.email ?? (member as any).email ?? '';
                    const avatarUrl =
                      member.user?.avatarUrl ?? (member as any).avatarUrl;
                    const memberUserId = member.user?.id ?? (member as any).userId;

                    return (
                      <div
                        key={member.id}
                        className="p-3 rounded-2xl bg-ploty-sage/15 border border-ploty-charcoal/10 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={username}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-ploty-periwinkle/30 flex items-center justify-center font-bold text-xs text-ploty-charcoal">
                              {(username || 'U').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-black">{username}</p>
                            <p className="text-[11px] text-ploty-charcoal/60">
                              {email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-ploty-charcoal text-ploty-white">
                            {member.role}
                          </span>

                          {isOwnerOrAdmin &&
                            memberUserId &&
                            memberUserId !== currentUser?.id &&
                            member.role !== 'OWNER' && (
                              <button
                                onClick={() => handleRemoveMember(memberUserId)}
                                title="Remover miembro"
                                className="p-1.5 rounded-xl hover:bg-ploty-coral/10 text-ploty-coral transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-ploty-charcoal/60 italic py-2">
                    No hay otros colaboradores agregados.
                  </p>
                )}
              </div>
            </div>

            {/* Member Search & Invitation (Owner/Admin only) — Roles aligned: MEMBER & ADMIN only */}
            {isOwnerOrAdmin && (
              <div className="pt-4 border-t border-ploty-charcoal/10">
                <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal mb-2">
                  Invitar Colaborador por Búsqueda Reactiva
                </label>

                <div className="flex items-center gap-2 mb-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-ploty-charcoal/50 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Buscar por usuario o email (ej. ana)..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-ploty-sage/20 border-2 border-ploty-charcoal/10 focus:border-ploty-periwinkle focus:outline-none text-xs font-medium"
                    />
                  </div>

                  <select
                    value={selectedRole}
                    onChange={(e) =>
                      setSelectedRole(e.target.value as 'MEMBER' | 'ADMIN')
                    }
                    className="px-3 py-2.5 rounded-2xl bg-ploty-sage/20 border-2 border-ploty-charcoal/10 text-xs font-bold focus:outline-none"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {searchLoading && (
                  <p className="text-xs text-ploty-periwinkle font-bold animate-pulse">
                    Buscando usuarios en el servidor...
                  </p>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-1.5 border border-ploty-charcoal/10 p-2 rounded-2xl bg-ploty-sage/10 max-h-36 overflow-y-auto">
                    {searchResults.map((u) => {
                      const alreadyMember = project.members?.some(
                        (m) => (m.user?.id || m.userId) === u.id,
                      );
                      return (
                        <div
                          key={u.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-ploty-white hover:bg-ploty-sage/20 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black">{u.username}</span>
                            <span className="text-[11px] text-ploty-charcoal/60">
                              ({u.email})
                            </span>
                          </div>

                          {alreadyMember ? (
                            <span className="text-[10px] font-bold text-ploty-charcoal/50 uppercase">
                              Ya en proyecto
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAddMember(u.id)}
                              className="px-2.5 py-1 rounded-xl bg-ploty-periwinkle text-ploty-white text-xs font-black flex items-center gap-1 shadow-sm hover:opacity-90 cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5" /> Agregar
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
