import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../lib/api';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token);
      navigate('/');
    } catch (err) {
      setError('Credenciales invalidas. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Panel Izquierdo - Visual Premium */}
      <div className="hidden lg:flex lg:w-3/5 bg-black relative overflow-hidden">
        <div className="absolute inset-0 grayscale opacity-60">
          <img 
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2070" 
            alt="Kavak Premium Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        
        <div className="relative z-10 p-20 flex flex-col justify-between w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <ShieldCheck className="text-black w-5 h-5" />
              </div>
              <span className="text-white font-bold tracking-[0.2em] text-xl uppercase">KAVAK</span>
            </div>
            <p className="text-gray-400 text-sm tracking-widest uppercase">Fleet Management System</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-xl"
          >
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              Control total sobre tu <span className="text-gray-500 italic">flota.</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              La plataforma inteligente para gestionar mantenimientos, optimizar recursos y garantizar la seguridad de tus activos.
            </p>
          </motion.div>

          <div className="flex items-center gap-8 text-gray-500 text-xs font-medium uppercase tracking-widest">
            <span>Premium Support</span>
            <div className="w-1 h-1 bg-gray-700 rounded-full" />
            <span>Smart Diagnostics</span>
            <div className="w-1 h-1 bg-gray-700 rounded-full" />
            <span>Fleet Analytics</span>
          </div>
        </div>
      </div>

      {/* Panel Derecho - Formulario Refinado */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-[#FBFBFD]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          <div className="mb-12 text-center lg:text-left">
            <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Bienvenido</h2>
            <p className="text-gray-500">Ingresa tus credenciales para acceder al sistema.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email corporativo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-2xl pl-11 pr-4 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all"
                  placeholder="ejemplo@kavak.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-2xl pl-11 pr-4 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="kavak-button kavak-button-primary w-full flex items-center justify-center gap-3 py-5"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <footer className="mt-10 text-center">
            <p className="text-sm text-gray-500">
              ¿Nueva organización?{' '}
              <Link 
                to="/register" 
                className="font-bold text-black border-b-2 border-transparent hover:border-black transition-all"
              >
                Registrar flota
              </Link>
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
};
