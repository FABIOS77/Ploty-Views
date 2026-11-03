import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, LogIn, Flame, Trophy, Coins, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, clearAuthError } from '../../store/slices/authSlice';
import { springConfig } from '../../common/motion/motion-skills';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
    if (!email || !password) return;
    dispatch(loginUser({ email, password }));
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-ploty-periwinkle/20 border border-ploty-periwinkle/40 text-ploty-periwinkle text-xs font-black uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Ploty Platform v3.0</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Gamifica tu productividad táctil.
            </h1>
            <p className="text-ploty-white/70 text-sm leading-relaxed mb-6">
              Gestiona tareas únicas y hábitos recurrentes, acumula XP, mantén rachas activas y desbloquea medallas cosméticas.
            </p>
          </div>

          {/* Gamification Preview Bento Pills */}
          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-ploty-white/10">
            <div className="p-3.5 rounded-2xl bg-ploty-white/5 border border-ploty-white/10 flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-ploty-coral flex-shrink-0" />
              <div>
                <p className="text-xs font-bold">Rachas Diarias</p>
                <p className="text-[11px] text-ploty-white/60">Multiplica tu XP</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-ploty-white/5 border border-ploty-white/10 flex items-center gap-2.5">
              <Coins className="w-5 h-5 text-ploty-gold flex-shrink-0" />
              <div>
                <p className="text-xs font-bold">Monedas Ploty</p>
                <p className="text-[11px] text-ploty-white/60">Tienda cosmética</p>
              </div>
            </div>

            <div className="col-span-2 p-3.5 rounded-2xl bg-ploty-white/5 border border-ploty-white/10 flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-ploty-periwinkle flex-shrink-0" />
              <div>
                <p className="text-xs font-bold">Arquitectura Funcional Pura</p>
                <p className="text-[11px] text-ploty-white/60">Transformaciones inmutables de tareas</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Login Form Bento Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={springConfig.tactile}
          className="bg-ploty-white text-ploty-charcoal p-8 rounded-3xl shadow-tactile flex flex-col justify-between"
        >
          <div>
            <h2 className="text-2xl font-black tracking-tight mb-2">Iniciar Sesión</h2>
            <p className="text-sm text-ploty-charcoal/70 mb-6">
              Ingresa tus credenciales para acceder a tu HUD.
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal/70 mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@ploty.app"
                  className="w-full px-4 py-3 rounded-2xl bg-ploty-sage/20 border-2 border-ploty-charcoal/10 focus:border-ploty-periwinkle focus:outline-none font-medium text-sm transition-all text-ploty-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal/70 mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-ploty-sage/20 border-2 border-ploty-charcoal/10 focus:border-ploty-periwinkle focus:outline-none font-medium text-sm transition-all text-ploty-charcoal"
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={springConfig.tactile}
                className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-ploty-periwinkle hover:bg-ploty-periwinkle/90 text-ploty-white font-black text-sm tracking-wide shadow-tactile-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-ploty-white border-t-transparent" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Ingresar al Juego</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-ploty-charcoal/10 text-center">
            <p className="text-xs text-ploty-charcoal/70">
              ¿No tienes cuenta de jugador?{' '}
              <Link
                to="/register"
                className="font-bold text-ploty-periwinkle hover:underline"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
