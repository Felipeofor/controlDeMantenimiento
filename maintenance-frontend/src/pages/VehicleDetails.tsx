import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { MaintenanceItem } from '../components/MaintenanceItem';
import { ArrowLeft, Plus, X, Gauge } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<any>(null);
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMileageModalOpen, setIsMileageModalOpen] = useState(false);
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newMileage, setNewMileage] = useState(0);
  const [newMaint, setNewMaint] = useState({
    tipoMantenimiento: 'CAMBIO_ACEITE',
    descripcion: '',
    costoEstimado: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vResponse, mResponse, cResponse] = await Promise.all([
        api.get(`/vehicles/${id}`),
        api.get(`/maintenances/vehicle/${id}`),
        api.get(`/vehicles/${id}/total-cost`)
      ]);
      setVehicle(vResponse.data);
      setMaintenances(mResponse.data);
      setTotalCost(cResponse.data.totalCost);
      setNewMileage(vResponse.data.kilometrajeActual);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleUpdateMileage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMileage < vehicle.kilometrajeActual) {
      alert('El nuevo kilometraje no puede ser menor al actual.');
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await api.patch(`/vehicles/${vehicle.id}/mileage`, { nuevoKilometraje: newMileage });
      setVehicle(response.data);
      setIsMileageModalOpen(false);
    } catch (error) {
      console.error('Error updating mileage', error);
      alert('Error al actualizar kilometraje.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMaint.descripcion.length < 5) {
      alert('La descripción es demasiado corta.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/maintenances', { ...newMaint, vehicleId: vehicle.id });
      setIsMaintModalOpen(false);
      setNewMaint({ tipoMantenimiento: 'CAMBIO_ACEITE', descripcion: '', costoEstimado: 0 });
      fetchData();
    } catch (error) {
      console.error('Error adding maintenance', error);
      alert('Error al agregar mantenimiento.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO') => {
    try {
      let costoFinal = null;
      if (status === 'COMPLETADO') {
        const input = prompt('Ingrese el costo final del servicio:', '0');
        if (input === null) return; // User cancelled prompt
        costoFinal = parseFloat(input);
        if (isNaN(costoFinal)) {
          alert('Costo inválido.');
          return;
        }
      }
      
      await api.patch(`/maintenances/${id}/status`, { nuevoEstado: status, costoFinal });
      fetchData();
    } catch (error) {
      console.error('Error updating status', error);
      alert('Error al actualizar el estado del mantenimiento.');
    }
  };

  // Derived technical data
  const maintenanceCount = maintenances.length;
  const lastMaintenance = maintenances.length > 0 
    ? new Date(Math.max(...maintenances.map(m => new Date(m.fechaCreacion).getTime()))).toLocaleDateString('es-AR')
    : 'N/A';
  
  const reliability = maintenanceCount > 5 ? 'Requiere Auditoría' : 'Óptimo';

  if (loading || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm italic animate-pulse">Consultando base de datos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24 pb-12 px-4 md:px-12 text-gray-900">
      <Navbar />
      
      <main className="max-w-5xl mx-auto">
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors mb-6 md:mb-12 group"
        >
          <ArrowLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Volver a Flota</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Main Info Card */}
            <div className="bg-white rounded-kavak p-8 md:p-12 shadow-kavak border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      Certificado Kavak
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{vehicle.patente}</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-none">
                    {vehicle.marca} <span className="text-primary italic">{vehicle.modelo}</span>
                  </h1>
                  <div className="flex items-center gap-6 text-gray-500 font-medium">
                    <div className="flex items-center gap-2">
                      <Gauge size={18} />
                      <span>{vehicle.kilometrajeActual.toLocaleString()} km</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                    <span>Año {vehicle.anio}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Total Invertido</span>
                  <div className="text-3xl font-bold text-primary tracking-tight">
                    ${totalCost.toLocaleString('es-AR')}
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-kavak border border-gray-100 shadow-sm space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Estado Técnico</span>
                <div className={`font-bold text-lg ${reliability === 'Óptimo' ? 'text-green-600' : 'text-amber-600'}`}>
                  {reliability}
                </div>
              </div>
              <div className="bg-white p-6 rounded-kavak border border-gray-100 shadow-sm space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Último Mantenimiento</span>
                <div className="font-bold text-lg">{lastMaintenance}</div>
              </div>
              <div className="bg-white p-6 rounded-kavak border border-gray-100 shadow-sm space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Historial Total</span>
                <div className="font-bold text-lg">{maintenanceCount} Registros</div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar Actions */}
          <motion.aside 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-black text-white p-8 rounded-kavak shadow-2xl space-y-8">
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight italic">Acciones Rápidas</h3>
                <p className="text-gray-500 text-[10px] font-medium uppercase tracking-widest">Gestión de Unidad</p>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsMileageModalOpen(true)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border border-white/5"
                >
                  Actualizar Kilometraje
                </button>
                <button 
                  onClick={() => setIsMaintModalOpen(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
                >
                  Programar Servicio
                </button>
              </div>
            </div>

            <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-kavak">
              <p className="text-[10px] text-blue-600 leading-relaxed font-bold uppercase tracking-widest italic">
                Información auditada por red Kavak Expert
              </p>
            </div>
          </motion.aside>
        </div>

        {/* Maintenance History List */}
        <section className="mt-16 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold italic uppercase tracking-tighter">Historial Técnico</h2>
            <div className="h-[1px] flex-grow mx-8 bg-gray-200"></div>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence mode='popLayout'>
              {maintenances.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-24 bg-white rounded-kavak border border-dashed border-gray-200 text-gray-300 italic font-medium"
                >
                  No hay registros de mantenimiento para esta unidad.
                </motion.div>
              ) : (
                maintenances.map((m, idx) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <MaintenanceItem 
                      id={m.id}
                      tipo={m.tipoMantenimiento}
                      descripcion={m.descripcion}
                      fecha={m.fechaCreacion}
                      estado={m.estado}
                      costo={m.costoFinal || m.costoEstimado}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Modals Implementation */}
      <AnimatePresence>
        {isMileageModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">Kilometraje</h2>
                  <button 
                    onClick={() => setIsMileageModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>
                <form onSubmit={handleUpdateMileage} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Kilometraje Final</label>
                    <div className="flex items-center gap-4 border-b-2 border-primary/10 py-4 focus-within:border-primary transition-colors">
                      <Gauge size={24} className="text-primary" />
                      <input 
                        type="number"
                        required
                        min={vehicle.kilometrajeActual}
                        className="w-full outline-none font-bold text-3xl tracking-tight"
                        value={newMileage}
                        onChange={e => setNewMileage(parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="kavak-button-primary w-full py-5 text-xs font-black uppercase tracking-[.2em] disabled:opacity-50"
                  >
                    {submitting ? 'Guardando...' : 'Confirmar Actualización'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {isMaintModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">Servicio Técnico</h2>
                  <button 
                    onClick={() => setIsMaintModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>
                <form onSubmit={handleAddMaintenance} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Especialidad</label>
                      <select 
                        className="w-full border-b border-gray-200 py-3 outline-none font-bold text-sm bg-transparent focus:border-primary transition-colors"
                        value={newMaint.tipoMantenimiento}
                        onChange={e => setNewMaint({...newMaint, tipoMantenimiento: e.target.value})}
                      >
                        <option value="CAMBIO_ACEITE">Mecánica Ligera</option>
                        <option value="FRENOS">Sistema de Frenado</option>
                        <option value="NEUMATICOS">Neumáticos & Alineación</option>
                        <option value="MOTOR">Ingeniería de Motor</option>
                        <option value="SUSPENSION">Tren Delantero</option>
                        <option value="ELECTRICO">Electrónica & Sensores</option>
                        <option value="OTRO">Auditoría General</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Presupuesto ($)</label>
                      <input 
                        type="number"
                        required
                        min={0}
                        className="w-full border-b border-gray-200 py-3 outline-none font-bold text-sm focus:border-primary transition-colors"
                        value={newMaint.costoEstimado}
                        onChange={e => setNewMaint({...newMaint, costoEstimado: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Diagnóstico Técnico</label>
                    <textarea 
                      required
                      minLength={5}
                      className="w-full border-b border-gray-200 py-3 outline-none text-sm min-h-[120px] resize-none focus:border-primary transition-colors"
                      placeholder="Describa el diagnóstico o servicio requerido para esta unidad..."
                      value={newMaint.descripcion}
                      onChange={e => setNewMaint({...newMaint, descripcion: e.target.value})}
                    />
                  </div>
                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="kavak-button-primary w-full py-5 text-xs font-black uppercase tracking-[.2em] disabled:opacity-50"
                    >
                      {submitting ? 'Procesando...' : 'Programar Ingreso'}
                    </button>
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
