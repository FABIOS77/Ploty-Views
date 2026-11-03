import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  CheckSquare,
  Award,
  BarChart3,
  Layers,
} from 'lucide-react';
import { springConfig } from '../common/motion/motion-skills';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { to: '/projects', label: 'Proyectos', icon: FolderKanban },
  { to: '/activities', label: 'Actividades', icon: CheckSquare },
  { to: '/shop', label: 'Recompensas', icon: Award },
  { to: '/reports', label: 'Métricas', icon: BarChart3 },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-full md:w-64 bg-ploty-charcoal text-ploty-white flex flex-col justify-between p-4 md:p-6 md:min-h-[calc(100vh-65px)] border-r border-ploty-white/10 shadow-tactile">
      <div className="flex flex-col gap-6">
        {/* Navigation Section */}
        <div className="flex items-center gap-2 px-3 text-xs font-black uppercase tracking-widest text-ploty-sage/70">
          <Layers className="w-4 h-4 text-ploty-periwinkle" />
          <span>Navegación Bento</span>
        </div>

        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
                  isActive
                    ? 'text-ploty-white shadow-tactile-sm'
                    : 'text-ploty-white/70 hover:text-ploty-white hover:bg-ploty-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActiveBackground"
                      className="absolute inset-0 bg-ploty-periwinkle rounded-2xl -z-10 shadow-tactile-sm"
                      transition={springConfig.tactile}
                    />
                  )}
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Gamification Level 0 Footer Banner */}
      <div className="hidden md:block mt-8 p-4 rounded-3xl bg-ploty-white/5 border border-ploty-white/10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-ploty-gold animate-ping" />
          <span className="text-[11px] font-black uppercase tracking-wider text-ploty-gold">
            Paleta Nivel 0
          </span>
        </div>
        <p className="text-xs text-ploty-white/70 leading-relaxed">
          Diseño Tactile Bento con soporte completo para programación funcional y recompensas dopamínicas.
        </p>
      </div>
    </aside>
  );
};
