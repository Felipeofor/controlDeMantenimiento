import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { VehicleCard } from '../components/VehicleCard';
import { RotateCcw, Search } from 'lucide-react';
import api from '../lib/api';

export const Home: React.FC<{ onSelectVehicle: (v: any) => void }> = ({ onSelectVehicle }) => {
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

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vehicles');
      const vehiclesData = response.data;
      
      // Fetch availability for each vehicle
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (newVehicle.patente.trim().length < 6) {
      alert('La patente es demasiado corta.');
      return;
    }
    if (newVehicle.anio < 1900 || newVehicle.anio > new Date().getFullYear() + 1) {
      alert('Año inválido.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/vehicles', newVehicle);
      setIsRegisterModalOpen(false);
      setNewVehicle({ patente: '', marca: '', modelo: '', anio: new Date().getFullYear(), kilometrajeActual: 0 });
      fetchVehicles();
    } catch (error) {
      console.error('Error registering vehicle', error);
      alert('Error al registrar el vehículo. Verifique que la patente no esté ya registrada.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24 pb-12 px-4 md:px-12">
      <Navbar />
      
      <main className="max-w-7xl mx-auto space-y-12">
        <header className="space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              Felipe, continuá tu camino
            </h1>
            <p className="text-gray-500 text-base md:text-lg">Gestioná la flota de Kavak Expert de forma simple y segura.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-grow max-w-xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscá por modelo o patente..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-kavak shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsRegisterModalOpen(true)}
                className="kavak-button kavak-button-primary flex-grow sm:flex-grow-0"
              >
                Registrar
              </button>
              <button className="p-3 bg-white border border-gray-200 rounded-kavak hover:bg-gray-50 transition-colors" onClick={fetchVehicles}>
                <RotateCcw className={loading ? "animate-spin" : "text-gray-500"} size={20} />
              </button>
            </div>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {vehicles
              .filter(v => 
                v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                v.patente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.marca.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(v => (
                <div key={v.id} onClick={() => onSelectVehicle(v)}>
                  <VehicleCard {...v} />
                </div>
              ))
            }
          </div>
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
