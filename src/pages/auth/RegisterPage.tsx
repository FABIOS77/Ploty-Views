import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser, clearAuthError } from '../../store/slices/authSlice';
import { springConfig } from '../../common/motion/motion-skills';

export const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/activities', { replace: true });
    }
    return () => {
      dispatch(clearAuthError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) return;
    dispatch(
      registerUser({
        username,
        email,
        password,
        avatarUrl: avatarUrl || undefined,
      }),
    );
  };

  return (
    <div className="min-h-screen bg-ploty-sage flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left Side: Bento Brand Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={springConfig.tactile}
          className="bg-ploty-charcoal text-ploty-white p-8 rounded-3xl shadow-tactile flex flex-col justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-ploty-gold/20 border border-ploty-gold/40 text-ploty-gold text-xs font-black uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Nuevo Jugador</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Crea tu perfil y desbloquea el Nivel 1.
            </h1>
            <p className="text-ploty-white/70 text-sm leading-relaxed mb-6">
              Al registrarte recibirás automáticamente tu tema inicial de la paleta oficial Bento Nivel 0 y acceso inmediato a actividades y proyectos colaborativos.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-ploty-white/5 border border-ploty-white/10 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-ploty-periwinkle flex-shrink-0" />
            <p className="text-xs text-ploty-white/80 leading-snug">
              Tus credenciales están protegidas con hash bcrypt y sesiones JWT seguras.
            </p>
          </div>
        </motion.div>

        {/* Right Side: Register Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={springConfig.tactile}
          className="bg-ploty-white text-ploty-charcoal p-8 rounded-3xl shadow-tactile flex flex-col justify-between"
        >
          <div>
            <h2 className="text-2xl font-black tracking-tight mb-2">Crear Cuenta</h2>
            <p className="text-sm text-ploty-charcoal/70 mb-6">
              Empieza a convertir tus metas diarias en progreso gamificado.
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-2xl bg-ploty-coral/10 border border-ploty-coral/30 text-ploty-coral flex items-center gap-2 text-xs font-bold"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal/70 mb-1.5">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. valkiria_coder"
                  className="w-full px-4 py-2.5 rounded-2xl bg-ploty-sage/20 border-2 border-ploty-charcoal/10 focus:border-ploty-periwinkle focus:outline-none font-medium text-sm transition-all text-ploty-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal/70 mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-2.5 rounded-2xl bg-ploty-sage/20 border-2 border-ploty-charcoal/10 focus:border-ploty-periwinkle focus:outline-none font-medium text-sm transition-all text-ploty-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal/70 mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-2.5 rounded-2xl bg-ploty-sage/20 border-2 border-ploty-charcoal/10 focus:border-ploty-periwinkle focus:outline-none font-medium text-sm transition-all text-ploty-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal/70 mb-1.5">
                  URL de Avatar (Opcional)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-ploty-sage/20 border-2 border-ploty-charcoal/10 focus:border-ploty-periwinkle focus:outline-none font-medium text-sm transition-all text-ploty-charcoal"
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={springConfig.tactile}
                className="w-full mt-2 py-3 px-6 rounded-2xl bg-ploty-periwinkle hover:bg-ploty-periwinkle/90 text-ploty-white font-black text-sm tracking-wide shadow-tactile-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-ploty-white border-t-transparent" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Registrar e Iniciar HUD</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-ploty-charcoal/10 text-center">
            <p className="text-xs text-ploty-charcoal/70">
              ¿Ya tienes cuenta de jugador?{' '}
              <Link
                to="/login"
                className="font-bold text-ploty-periwinkle hover:underline"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
