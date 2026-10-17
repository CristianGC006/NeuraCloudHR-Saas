import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { getAuthSession, loginDemo } from '../data/hrStore';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (getAuthSession()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Por favor ingresa tu usuario.');
      return;
    }
    if (!password.trim()) {
      setError('Por favor ingresa tu contraseña.');
      return;
    }

    setLoading(true);

    // Simulate natural authentication feedback
    setTimeout(() => {
      const result = loginDemo(username, password);
      setLoading(false);

      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setError(result.message || 'Credenciales inválidas.');
      }
    }, 400);
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 shadow-xl shadow-brand-900/40 mb-4 border border-brand-500/30">
            <Cpu size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">NeuraCloud HR</h1>
          <p className="text-sm text-slate-400 mt-1">Plataforma SaaS de Gestión Humana y Nómina</p>
        </div>

        {/* Login Card */}
        <div className="card glass shadow-2xl p-7 border-surface-border">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-surface-border/80">
            <div>
              <h2 className="text-lg font-bold text-white">Iniciar Sesión</h2>
              <p className="text-xs text-slate-400">Acceso al panel de control corporativo</p>
            </div>
            <span className="badge-blue text-[11px] font-mono">Demo v2.0</span>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  className="input pl-10 h-11 text-sm bg-slate-900/60"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="admin"
                  className="input pl-10 pr-10 h-11 text-sm bg-slate-900/60"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 justify-center text-sm font-semibold tracking-wide shadow-lg shadow-brand-900/50 mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Ingresar a NeuraCloud</span>
                  <ArrowRight size={16} />
                </div>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-6 pt-4 border-t border-surface-border/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Credenciales de demo:</span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
              >
                Cargar admin / admin
              </button>
            </div>
            <div className="mt-2.5 bg-slate-900/80 rounded-xl p-2.5 border border-surface-border text-xs text-slate-400 flex items-center justify-between">
              <div>
                <span className="text-slate-500">Usuario:</span> <code className="text-brand-300 font-mono">admin</code>
              </div>
              <div className="h-3 w-px bg-slate-700" />
              <div>
                <span className="text-slate-500">Clave:</span> <code className="text-brand-300 font-mono">admin</code>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Prototype Notice */}
        <div className="mt-6 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck size={14} className="text-slate-400" />
            <span>Entorno seguro de demostración local con LocalStorage</span>
          </div>
          <p className="text-[11px] text-slate-600 max-w-sm mx-auto">
            Este mecanismo de acceso es exclusivamente para evaluación del prototipo y no constituye un esquema de seguridad productivo.
          </p>
        </div>
      </div>
    </div>
  );
}
