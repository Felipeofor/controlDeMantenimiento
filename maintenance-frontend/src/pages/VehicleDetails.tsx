import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { MaintenanceItem } from '../components/MaintenanceItem';
import { ArrowLeft, Plus, X, Gauge } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';

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
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors mb-6 md:mb-12 group"
        >
          <ArrowLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Volver al catálogo</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          <section className="lg:col-span-2 space-y-8 md:space-y-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[.4em] text-[9px]">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                Kavak Expert Fleet
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black leading-tight">
                {vehicle.marca} {vehicle.modelo}
              </h1>
              <div className="inline-block px-4 py-1.5 bg-gray-100 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase text-gray-600">
                {vehicle.patente}
              </div>
            </div>

            <section className="bg-white border border-gray-100 rounded-kavak shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base md:text-lg font-bold">Historial de Servicio</h2>
                <button 
                  onClick={() => setIsMaintModalOpen(true)}
                  className="p-2 text-gray-300 hover:text-primary transition-colors"
                >
                  <Plus size={24} />
                </button>
              </div>
              
              <div className="p-6 md:p-8">
                {loading ? (
                  <div className="flex justify-center py-12 text-gray-300 text-sm italic">Consultando base de datos...</div>
                ) : (
                  <div className="space-y-4">
                    {maintenances.length === 0 ? (
                      <div className="text-center py-12 text-gray-400 text-sm">No hay registros de mantenimiento.</div>
                    ) : (
                      maintenances.map(m => (
                        <MaintenanceItem 
                          key={m.id}
                          id={m.id}
                          tipo={m.tipoMantenimiento}
                          descripcion={m.descripcion}
                          fecha={m.fechaCreacion}
                          estado={m.estado}
                          costo={m.costoFinal || m.costoEstimado}
                          onUpdateStatus={handleUpdateStatus}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            </section>
          </section>
          
          <aside className="space-y-6">
            <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-kavak shadow-sm flex flex-col gap-6 md:gap-8">
              <div className="space-y-2">
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1 md:mb-2 block">Kilometraje Actual</span>
                <div className="flex items-baseline gap-2 text-4xl md:text-5xl font-bold text-black tracking-tighter">
                  <span>{vehicle.kilometrajeActual.toLocaleString()}</span>
                  <span className="text-xs md:text-sm text-gray-300 font-normal tracking-widest uppercase">KM</span>
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-50 pt-6 md:pt-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium text-xs md:text-sm">Año del modelo</span>
                  <span className="font-bold text-xs md:text-sm">{vehicle.anio}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium text-xs md:text-sm">Inversión Total</span>
                  <span className="font-bold text-xs md:text-sm text-primary">$ {totalCost.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={() => setIsMileageModalOpen(true)}
                className="kavak-button-primary w-full py-4 uppercase tracking-[.2em] text-[10px] font-black"
              >
                Actualizar Kilometraje
              </button>
            </div>
            
            <div className="p-4 md:p-6 bg-blue-50/50 border border-blue-100 rounded-kavak">
              <p className="text-[9px] md:text-[10px] text-blue-600 leading-relaxed font-bold uppercase tracking-widest italic">
                Unidad Certificada por Kavak
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Mileage Modal */}
      {isMileageModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-kavak w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Kilometraje</h2>
                <button onClick={() => setIsMileageModalOpen(false)}><X size={20} className="text-gray-400 hover:text-black transition-colors" /></button>
              </div>
              <form onSubmit={handleUpdateMileage} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nuevo KM Total</label>
                  <div className="flex items-center gap-3 border-b border-gray-200 py-2">
                    <Gauge size={18} className="text-primary" />
                    <input 
                      type="number"
                      required
                      min={vehicle.kilometrajeActual}
                      className="w-full outline-none font-bold text-lg"
                      value={newMileage}
                      onChange={e => setNewMileage(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="kavak-button-primary w-full py-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                >
                  {submitting ? 'Actualizando...' : 'Actualizar'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {isMaintModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-kavak w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Nuevo Mantenimiento</h2>
                <button onClick={() => setIsMaintModalOpen(false)}><X size={20} className="text-gray-400 hover:text-black transition-colors" /></button>
              </div>
              <form onSubmit={handleAddMaintenance} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tipo de Servicio</label>
                    <select 
                      className="w-full border-b border-gray-200 py-2 outline-none font-bold text-sm bg-transparent"
                      value={newMaint.tipoMantenimiento}
                      onChange={e => setNewMaint({...newMaint, tipoMantenimiento: e.target.value})}
                    >
                      <option value="CAMBIO_ACEITE">Cambio de Aceite</option>
                      <option value="FRENOS">Frenos</option>
                      <option value="NEUMATICOS">Neumáticos</option>
                      <option value="MOTOR">Motor</option>
                      <option value="SUSPENSION">Suspensión</option>
                      <option value="ELECTRICO">Eléctrico</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Descripción del problema</label>
                    <textarea 
                      required
                      minLength={5}
                      className="w-full border-b border-gray-200 py-2 outline-none text-sm min-h-[80px]"
                      placeholder="Describa el servicio solicitado..."
                      value={newMaint.descripcion}
                      onChange={e => setNewMaint({...newMaint, descripcion: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Costo Estimado ($)</label>
                    <input 
                      type="number"
                      required
                      min={0}
                      className="w-full border-b border-gray-200 py-2 outline-none font-bold text-sm"
                      value={newMaint.costoEstimado}
                      onChange={e => setNewMaint({...newMaint, costoEstimado: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="kavak-button-primary w-full py-4 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                >
                  {submitting ? 'Programando...' : 'Programar Ingreso'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
