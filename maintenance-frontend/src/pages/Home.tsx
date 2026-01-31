import React, { useEffect, useState } from 'react';
import { getErrorMessage } from '../lib/utils';
import { toast } from 'sonner';
import { Navbar } from '../components/Navbar';
import { VehicleCard } from '../components/VehicleCard';
import { RotateCcw, Search, Plus, X, Gauge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [newVehicle, setNewVehicle] = useState({
    patente: '',
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    kilometrajeActual: 0,
    proximoMantenimientoKm: 0
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newVehicle.patente.trim().length < 6) {
      toast.error('La patente es demasiado corta.');
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/vehicles', newVehicle);
      setIsRegisterModalOpen(false);
      setNewVehicle({ patente: '', marca: '', modelo: '', anio: new Date().getFullYear(), kilometrajeActual: 0, proximoMantenimientoKm: 0 });
      fetchVehicles();
      fetchVehicles();
    } catch (error: any) {
      console.error('Error registering vehicle', error);
      toast.error(getErrorMessage(error, 'Error al registrar el vehículo.'));
    } finally {
      setSubmitting(false);
    }
  };

  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.isAvailable).length;
  const inServiceVehicles = totalVehicles - availableVehicles;

  const chartData = [
    { name: t('home.available'), value: availableVehicles, color: '#6600ff' },
    { name: t('home.in_service'), value: inServiceVehicles, color: '#ffb800' },
  ];

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vehicles');
      setVehicles(response.data.map((v: any) => ({
        ...v,
        isAvailable: v.disponible
      })));
    } catch (error: any) {
      console.error('Error fetching vehicles', error);
      toast.error(getErrorMessage(error, t('common.error_generic')));
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics/fleet');
      setAnalytics(response.data);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics', error);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24 pb-12 px-2 md:px-12 overflow-x-hidden">
      <Navbar />
      
      <main className="max-w-7xl mx-auto space-y-16">
        {/* --- HERO SECTION --- */}
        <section className="relative pt-8 overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-12 items-start justify-between">
            <div className="space-y-6 max-w-xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                  <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                  {t('home.fleet_live_status')}
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tighter leading-[0.9]">
                  Kavak <br />
                  <span className="text-primary italic">{t('common.expert_fleet')}</span>
                </h1>
                <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
                  {t('home.dashboard_title')}
                </p>
              </motion.div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                <div className="flex flex-1 items-center gap-4 bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm group focus-within:ring-2 ring-primary/20 transition-all">
                  <Search size={20} className="text-gray-300 group-hover:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder={t('home.search_placeholder')}
                    className="w-full outline-none text-sm font-medium"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="bg-black text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl shadow-black/10 flex items-center gap-2 shrink-0"
                  >
                    <Plus size={18} />
                    <span>{t('home.register_vehicle')}</span>
                  </motion.button>
                  <button 
                    className="p-4 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
                    onClick={fetchVehicles}
                    title="Actualizar datos"
                  >
                    <RotateCcw className={loading ? "animate-spin text-primary" : "text-gray-500"} size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* --- TOP ANALYTICS CLUSTER --- */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full lg:w-auto flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 lg:min-w-[500px]"
            >
              {/* Pie Chart Card - Highlight */}
              <div className="bg-black text-white p-8 rounded-[40px] shadow-2xl flex flex-col justify-between overflow-hidden relative group">
                <div className="relative z-10 flex flex-col gap-10">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('home.total_vehicles')}</div>
                    <div className="text-5xl font-bold tracking-tighter">{totalVehicles}</div>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[10px] uppercase font-bold text-gray-400">{t('home.available')}</span>
                      </div>
                      <span className="text-lg font-bold">{availableVehicles}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#ffb800]" />
                        <span className="text-[10px] uppercase font-bold text-gray-400">{t('home.in_service')}</span>
                      </div>
                      <span className="text-lg font-bold">{inServiceVehicles}</span>
                    </div>
                  </div>
                </div>
                
                {/* Background Pie Chart (subtle) */}
                <div className="absolute top-1/2 -right-10 -translate-y-1/2 w-[220px] h-[220px] opacity-40 blur-[1px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Analytics Mini Grid */}
              <div className="grid grid-rows-2 gap-4">
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('home.total_investment')}</div>
                  <div className="text-3xl font-bold text-primary tracking-tighter italic">
                    ${analytics?.totalSpent?.toLocaleString() || '-'}
                  </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('home.average_cost')}</div>
                  <div className="text-3xl font-bold text-gray-900 tracking-tighter">
                    ${analytics?.averageMaintenanceCost?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '-'}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold italic uppercase tracking-tighter">{t('home.dashboard_title')}</h2>
            <div className="h-[1px] flex-grow bg-gray-200"></div>
          </div>
          
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8"
          >
            <AnimatePresence mode='popLayout'>
              {loading ? (
                <motion.div key="loading" className="col-span-full py-24 text-center">
                  <div className="w-12 h-12 border-4 border-gray-100 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400 italic text-sm">{t('common.loading')}</p>
                </motion.div>
              ) : vehicles.length === 0 ? (
                <motion.div key="empty" className="col-span-full py-24 text-center text-gray-400 italic">
                  {t('home.empty_fleet')}
                </motion.div>
              ) : vehicles
                  .filter(v => 
                    v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    v.patente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    v.marca.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((v, idx) => (
                    <motion.div 
                      key={v.id} 
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      onClick={() => navigate(`/vehicle/${v.id}`)}
                      className="cursor-pointer"
                    >
                      <VehicleCard {...v} />
                    </motion.div>
                  ))
              }
            </AnimatePresence>
          </motion.div>
        </section>
      </main>

      <AnimatePresence>
        {isRegisterModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 md:p-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8 overflow-hidden shrink-0">
                  <h2 className="text-3xl font-bold tracking-tight">{t('home.register_vehicle')}</h2>
                  <button onClick={() => setIsRegisterModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                    <X size={24} className="text-gray-400 hover:text-black transition-colors" />
                  </button>
                </div>

                <form onSubmit={handleRegister} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">{t('modals.identification')}</label>
                      <input 
                        required
                        className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-primary transition-colors text-lg font-bold uppercase tracking-widest bg-transparent"
                        placeholder="Patente (ej. ABC 123)"
                        value={newVehicle.patente}
                        onChange={e => setNewVehicle({...newVehicle, patente: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">{t('modals.manufacture_year')}</label>
                       <input 
                         required
                         type="number"
                         className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-primary transition-colors text-lg font-bold bg-transparent"
                         value={newVehicle.anio}
                         onChange={e => setNewVehicle({...newVehicle, anio: parseInt(e.target.value)})}
                       />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">{t('modals.brand')}</label>
                      <input 
                        required
                        className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-primary transition-colors text-lg font-bold bg-transparent"
                        placeholder="Ej. Toyota"
                        value={newVehicle.marca}
                        onChange={e => setNewVehicle({...newVehicle, marca: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">{t('modals.model')}</label>
                      <input 
                        required
                        className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-primary transition-colors text-lg font-bold bg-transparent"
                        placeholder="Ej. Corolla"
                        value={newVehicle.modelo}
                        onChange={e => setNewVehicle({...newVehicle, modelo: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">{t('modals.current_odometer')}</label>
                      <div className="flex items-center gap-3 border-b-2 border-gray-100 py-2 focus-within:border-primary transition-colors">
                        <Gauge size={18} className="text-gray-400" />
                        <input 
                          required
                          type="number"
                          className="w-full outline-none text-lg font-bold bg-transparent"
                          placeholder="Kilometraje"
                          value={newVehicle.kilometrajeActual}
                          onChange={e => setNewVehicle({...newVehicle, kilometrajeActual: parseFloat(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">{t('modals.maintenance_plan')}</label>
                      <div className="flex items-center gap-3 border-b-2 border-gray-100 py-2 focus-within:border-primary transition-colors">
                        <Gauge size={18} className="text-gray-400" />
                        <input 
                          required
                          type="number"
                          className="w-full outline-none text-lg font-bold bg-transparent"
                          placeholder="Próximo Service (KM)"
                          value={newVehicle.proximoMantenimientoKm}
                          onChange={e => setNewVehicle({...newVehicle, proximoMantenimientoKm: parseFloat(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 shrink-0">
                    <motion.button 
                      whileTap={{ scale: 0.98 }}
                      type="submit" 
                      disabled={submitting}
                      className="kavak-button-primary w-full py-5 uppercase tracking-[.3em] font-black text-xs disabled:opacity-50 shadow-xl shadow-primary/20"
                    >
                      {submitting ? t('common.save') + '...' : t('common.save')}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
