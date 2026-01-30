import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { VehicleCard } from '../components/VehicleCard';
import { RotateCcw, Search, Plus, X, Gauge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    patente: '',
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    kilometrajeActual: 0
  });
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newVehicle.patente.trim().length < 6) return alert('La patente es demasiado corta.');
    try {
      setSubmitting(true);
      await api.post('/vehicles', newVehicle);
      setIsRegisterModalOpen(false);
      setNewVehicle({ patente: '', marca: '', modelo: '', anio: new Date().getFullYear(), kilometrajeActual: 0 });
      fetchVehicles();
    } catch (error) {
      alert('Error al registrar el vehículo.');
    } finally {
      setSubmitting(false);
    }
  };

  // Stats derived from data
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.isAvailable).length;
  const inServiceVehicles = totalVehicles - availableVehicles;

  const chartData = [
    { name: 'Disponibles', value: availableVehicles, color: '#6600ff' },
    { name: 'En Taller', value: inServiceVehicles, color: '#ffb800' },
  ];

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vehicles');
      const vehiclesData = response.data;
      
      const vehiclesWithStatus = await Promise.all(vehiclesData.map(async (v: any) => {
        try {
          const availResponse = await api.get(`/vehicles/${v.id}/availability`);
          return { ...v, isAvailable: availResponse.data.available };
        } catch {
          return { ...v, isAvailable: true };
        }
      }));

      setVehicles(vehiclesWithStatus);
    } catch (error) {
      console.error('Error fetching vehicles', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24 pb-12 px-4 md:px-12">
      <Navbar />
      
      <main className="max-w-7xl mx-auto space-y-12">
        <header className="space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2"
              >
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
                  Felipe, <span className="text-primary italic">continuá tu camino</span>
                </h1>
                <p className="text-gray-500 text-base md:text-xl font-medium max-w-2xl">
                  Panel de control de flota Kavak Expert. Monitoreo en tiempo real y gestión técnica centralizada.
                </p>
              </motion.div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                <div className="flex-grow max-w-xl relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Buscá por modelo o patente..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-kavak shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-gray-900 font-medium"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="kavak-button-primary px-8 py-4 uppercase tracking-[.2em] font-black text-[10px]"
                  >
                    Registrar Unidad
                  </button>
                  <button 
                    className="p-4 bg-white border border-gray-200 rounded-kavak hover:bg-gray-50 transition-colors shadow-sm"
                    onClick={fetchVehicles}
                    title="Actualizar datos"
                  >
                    <RotateCcw className={loading ? "animate-spin text-primary" : "text-gray-500"} size={20} />
                  </button>
                </div>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-kavak shadow-kavak border border-gray-100 flex items-center gap-8 min-w-[320px] lg:min-w-[420px]"
            >
              <div className="h-[120px] w-[120px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={45}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4 flex-grow">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Distribución de Flota</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{totalVehicles}</span>
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Unidades</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Disponibles</span>
                    </div>
                    <span className="text-lg font-bold block leading-none">{availableVehicles}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#ffb800]"></div>
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">En Servicio</span>
                    </div>
                    <span className="text-lg font-bold block leading-none">{inServiceVehicles}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg md:text-xl font-bold text-black italic uppercase italic shrink-0">Vehículos de Flota</h2>
            <div className="h-[1px] flex-grow bg-gray-200 hidden sm:block"></div>
            <span className="text-xs md:text-sm text-gray-400 font-medium shrink-0">
              {vehicles.filter(v => 
                v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                v.patente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.marca.toLowerCase().includes(searchTerm.toLowerCase())
              ).length} Unidades
            </span>
          </div>
          
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8"
          >
            <AnimatePresence mode='popLayout'>
              {vehicles
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

      {/* Register Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-kavak w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Nuevo Vehículo</h2>
                <button 
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="text-gray-400 hover:text-black transition-colors"
                >
                  <RotateCcw size={24} className="rotate-45" /> 
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Patente</label>
                    <input 
                      required
                      className="w-full border-b border-gray-200 py-2 outline-none focus:border-primary transition-colors text-sm font-bold uppercase tracking-widest"
                      placeholder="ABC 123"
                      value={newVehicle.patente}
                      onChange={e => setNewVehicle({...newVehicle, patente: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Año</label>
                    <input 
                      required
                      type="number"
                      className="w-full border-b border-gray-200 py-2 outline-none focus:border-primary transition-colors text-sm font-bold"
                      value={newVehicle.anio}
                      onChange={e => setNewVehicle({...newVehicle, anio: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Marca</label>
                    <input 
                      required
                      className="w-full border-b border-gray-200 py-2 outline-none focus:border-primary transition-colors text-sm font-bold"
                      placeholder="Ej. Toyota"
                      value={newVehicle.marca}
                      onChange={e => setNewVehicle({...newVehicle, marca: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Modelo</label>
                    <input 
                      required
                      className="w-full border-b border-gray-200 py-2 outline-none focus:border-primary transition-colors text-sm font-bold"
                      placeholder="Ej. Corolla"
                      value={newVehicle.modelo}
                      onChange={e => setNewVehicle({...newVehicle, modelo: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Kilometraje Inicial</label>
                    <input 
                      required
                      type="number"
                      className="w-full border-b border-gray-200 py-2 outline-none focus:border-primary transition-colors text-sm font-bold"
                      value={newVehicle.kilometrajeActual}
                      onChange={e => setNewVehicle({...newVehicle, kilometrajeActual: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="kavak-button kavak-button-primary w-full py-4 uppercase tracking-[.2em] font-black text-xs disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar Vehículo'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
