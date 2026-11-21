import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser, clearAuthError } from '../../store/slices/authSlice';
import { springConfig } from '../../common/motion/motion-skills';
import {
  evaluatePasswordStrength,
  isErr,
  validateRegisterForm,
  type FieldErrors,
} from '../../common/fp';

export const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/activities', { replace: true });
    }
    return () => {
      dispatch(clearAuthError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  const strengthColor =
    strength.level === 'strong'
      ? 'bg-emerald-500 text-emerald-600'
      : strength.level === 'medium'
        ? 'bg-ploty-gold text-amber-600'
        : 'bg-ploty-coral text-ploty-coral';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateRegisterForm({
      username,
      email,
      password,
      confirmPassword,
      avatarUrl,
    });

    if (isErr(validation)) {
      setFieldErrors(validation.error);
      return;
    }

    setFieldErrors({});
    dispatch(registerUser(validation.value));
  };

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: '' });
    }
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
              Tus credenciales están protegidas con hash bcrypt, validación funcional estricta y sesiones JWT seguras.
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
            <p className="text-sm text-ploty-charcoal/70 mb-5">
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

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal/70 mb-1">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    clearFieldError('username');
                  }}
                  placeholder="ej. valkiria_coder"
                  className={`w-full px-4 py-2.5 rounded-2xl bg-ploty-sage/20 border-2 focus:outline-none font-medium text-sm transition-all text-ploty-charcoal ${
                    fieldErrors.username
                      ? 'border-ploty-coral'
                      : 'border-ploty-charcoal/10 focus:border-ploty-periwinkle'
                  }`}
                />
                {fieldErrors.username && (
                  <p className="mt-1 text-[11px] font-bold text-ploty-coral">
                    {fieldErrors.username}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal/70 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                  }}
                  placeholder="tu@correo.com"
                  className={`w-full px-4 py-2.5 rounded-2xl bg-ploty-sage/20 border-2 focus:outline-none font-medium text-sm transition-all text-ploty-charcoal ${
                    fieldErrors.email
                      ? 'border-ploty-coral'
                      : 'border-ploty-charcoal/10 focus:border-ploty-periwinkle'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-[11px] font-bold text-ploty-coral">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal/70 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError('password');
                  }}
                  placeholder="Mínimo 8 caracteres"
                  className={`w-full px-4 py-2.5 rounded-2xl bg-ploty-sage/20 border-2 focus:outline-none font-medium text-sm transition-all text-ploty-charcoal ${
                    fieldErrors.password
                      ? 'border-ploty-coral'
                      : 'border-ploty-charcoal/10 focus:border-ploty-periwinkle'
                  }`}
                />
                {/* Visual Password Strength Meter */}
                {password.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                      <span className="text-ploty-charcoal/60">Fortaleza</span>
                      <span className={strengthColor.split(' ')[1]}>
                        {strength.label} ({strength.score}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-ploty-sage/40 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strengthColor.split(' ')[0]}`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                )}
                {fieldErrors.password && (
                  <p className="mt-1 text-[11px] font-bold text-ploty-coral">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal/70 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearFieldError('confirmPassword');
                  }}
                  placeholder="Repite tu contraseña"
                  className={`w-full px-4 py-2.5 rounded-2xl bg-ploty-sage/20 border-2 focus:outline-none font-medium text-sm transition-all text-ploty-charcoal ${
                    fieldErrors.confirmPassword
                      ? 'border-ploty-coral'
                      : 'border-ploty-charcoal/10 focus:border-ploty-periwinkle'
                  }`}
                />
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-[11px] font-bold text-ploty-coral">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ploty-charcoal/70 mb-1">
                  URL de Avatar HTTPS (Opcional)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => {
                    setAvatarUrl(e.target.value);
                    clearFieldError('avatarUrl');
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className={`w-full px-4 py-2.5 rounded-2xl bg-ploty-sage/20 border-2 focus:outline-none font-medium text-sm transition-all text-ploty-charcoal ${
                    fieldErrors.avatarUrl
                      ? 'border-ploty-coral'
                      : 'border-ploty-charcoal/10 focus:border-ploty-periwinkle'
                  }`}
                />
                {fieldErrors.avatarUrl && (
                  <p className="mt-1 text-[11px] font-bold text-ploty-coral">
                    {fieldErrors.avatarUrl}
                  </p>
                )}
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

          <div className="mt-5 pt-4 border-t border-ploty-charcoal/10 text-center">
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
