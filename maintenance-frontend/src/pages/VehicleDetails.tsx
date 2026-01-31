import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { MaintenanceItem } from '../components/MaintenanceItem';
import { ArrowLeft, X, Gauge, FileText, Upload } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const VehicleDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<any>(null);
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [isMileageModalOpen, setIsMileageModalOpen] = useState(false);
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form states
  const [selectedMaintId, setSelectedMaintId] = useState<number | null>(null);
  const [newMileage, setNewMileage] = useState(0);
  const [newMaint, setNewMaint] = useState({ tipoMantenimiento: 'CAMBIO_ACEITE', descripcion: '', costoEstimado: 0 });
  const [newItem, setNewItem] = useState({ descripcion: '', tipo: 'REPUESTO', costo: 0 });
  const [newAttachment, setNewAttachment] = useState({ file: null as File | null });
  const [editVehicle, setEditVehicle] = useState({ patente: '', marca: '', modelo: '', anio: 0 });

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
      setEditVehicle({
        patente: vResponse.data.patente,
        marca: vResponse.data.marca,
        modelo: vResponse.data.modelo,
        anio: vResponse.data.anio
      });
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
      alert(t('common.error_km_lower'));
      return;
    }
    try {
      setSubmitting(true);
      const response = await api.patch(`/vehicles/${vehicle.id}/mileage`, { nuevoKilometraje: newMileage });
      setVehicle(response.data);
      setIsMileageModalOpen(false);
    } catch (error) {
      console.error('Error updating mileage', error);
      alert(t('common.error_generic'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/maintenances', { ...newMaint, vehicleId: vehicle.id });
      setIsMaintModalOpen(false);
      setNewMaint({ tipoMantenimiento: 'CAMBIO_ACEITE', descripcion: '', costoEstimado: 0 });
      fetchData();
    } catch (error) {
      console.error('Error adding maintenance', error);
      alert(t('common.error_generic'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaintId) return;
    try {
      setSubmitting(true);
      await api.post(`/maintenances/${selectedMaintId}/items`, newItem);
      setIsItemModalOpen(false);
      setNewItem({ descripcion: '', tipo: 'REPUESTO', costo: 0 });
      fetchData();
    } catch (error) {
      console.error('Error adding item', error);
      alert(t('common.error_generic'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaintId || !newAttachment.file) return;
    const formData = new FormData();
    formData.append('file', newAttachment.file);
    try {
      setSubmitting(true);
      await api.post(`/maintenances/${selectedMaintId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsAttachmentModalOpen(false);
      setNewAttachment({ file: null });
      fetchData();
    } catch (error) {
      console.error('Error uploading file', error);
      alert(t('common.error_generic'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO') => {
    try {
      let costoFinal = null;
      if (status === 'COMPLETADO') {
         // Si tiene items, el backend calcula el costo solo. Si no, preguntamos.
         const m = maintenances.find(item => item.id === id);
         if (!m.items || m.items.length === 0) {
            const input = prompt(t('common.prompt_cost'), '0');
            if (input === null) return;
            costoFinal = parseFloat(input);
         }
      }
      await api.patch(`/maintenances/${id}/status`, { nuevoEstado: status, costoFinal });
      fetchData();
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  const handleDeleteMaintenance = async (maintId: number) => {
    if (!window.confirm(t('common.confirm_delete_maintenance'))) return;
    try {
      await api.delete(`/maintenances/${maintId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting maintenance', error);
    }
  };

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await api.put(`/vehicles/${id}`, editVehicle);
      setVehicle(response.data);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating vehicle', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!window.confirm(t('common.confirm_delete_vehicle'))) return;
    try {
      await api.delete(`/vehicles/${id}`);
      navigate('/');
    } catch (error) {
      console.error('Error deleting vehicle', error);
    }
  };

  if (loading || !vehicle) return <div className="min-h-screen flex items-center justify-center italic text-gray-400">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24 pb-12 px-4 md:px-12">
      <Navbar />
      <main className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-center">
           <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors">
             <ArrowLeft size={18} />
             <span className="text-[10px] font-black uppercase tracking-widest">{t('common.back')}</span>
           </button>
           <div className="flex gap-2">
             <button onClick={() => setIsEditModalOpen(true)} className="kavak-button-ghost !px-4 !py-2 text-[10px] font-black uppercase tracking-widest">{t('common.edit')}</button>
             <button onClick={handleDeleteVehicle} className="kavak-button-ghost !px-4 !py-2 !border-red-100 !text-red-400 hover:!bg-red-50 text-[10px] font-black uppercase tracking-widest">{t('common.delete')}</button>
           </div>
        </div>

        {/* Vehicle Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-end gap-8 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary/10 text-primary text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">CERTIFIED</span>
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{vehicle.patente}</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">
                    {vehicle.marca} <br />
                    <span className="text-primary italic">{vehicle.modelo}</span>
                  </h1>
                  <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <div className="flex items-center gap-2"><Gauge size={14} className="text-primary"/> {vehicle.kilometrajeActual.toLocaleString()} KM</div>
                    <div className="flex items-center gap-2"><FileText size={14} className="text-primary"/> {vehicle.anio}</div>
                  </div>
                </div>
                <div className="bg-black text-white p-8 rounded-[32px] shrink-0 text-center md:text-left shadow-2xl relative z-10">
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Inversión Total</span>
                   <div className="text-4xl font-bold tracking-tight">${totalCost.toLocaleString('es-AR')}</div>
                </div>
           </div>

           <div className="bg-black text-white p-8 rounded-[40px] flex flex-col justify-between gap-8 shadow-2xl">
              <div>
                <h3 className="text-xl font-bold italic tracking-tight">Kavak Expert</h3>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Quick Actions</p>
              </div>
              <div className="space-y-3">
                <button onClick={() => setIsMileageModalOpen(true)} className="w-full bg-white/10 hover:bg-white/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors">Actualizar KM</button>
                <button onClick={() => setIsMaintModalOpen(true)} className="w-full bg-primary hover:bg-primary/90 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20">Programar Service</button>
              </div>
           </div>
        </div>

        {/* History Section */}
        <section className="space-y-8 pt-8">
           <div className="flex items-center gap-4">
             <h2 className="text-2xl font-bold italic uppercase tracking-tighter">Historial Técnico</h2>
             <div className="h-[1px] flex-grow bg-gray-200"></div>
           </div>
           
           <div className="space-y-4">
             {maintenances.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100 text-gray-300 italic">No hay registros aún</div>
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
                   adjuntos={m.adjuntos}
                   items={m.items}
                   onUpdateStatus={handleUpdateStatus}
                   onDelete={() => handleDeleteMaintenance(m.id)}
                   onAddAttachment={() => { setSelectedMaintId(m.id); setIsAttachmentModalOpen(true); }}
                   onAddItem={() => { setSelectedMaintId(m.id); setIsItemModalOpen(true); }}
                 />
               ))
             )}
           </div>
        </section>
      </main>

      {/* MODALS */}
      <AnimatePresence>
        {/* Mileage Modal */}
        {isMileageModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-[40px] p-10 w-full max-w-sm space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Actualizar KM</h2>
                  <button onClick={() => setIsMileageModalOpen(false)}><X/></button>
                </div>
                <form onSubmit={handleUpdateMileage} className="space-y-6">
                  <input type="number" value={newMileage} onChange={e => setNewMileage(parseInt(e.target.value))} className="w-full text-5xl font-bold tracking-tighter border-b-2 border-gray-100 focus:border-primary outline-none py-2" />
                  <button type="submit" disabled={submitting} className="kavak-button-primary w-full py-5 text-[10px] uppercase font-black tracking-widest">{submitting ? 'Confirmando...' : 'Confirmar'}</button>
                </form>
             </motion.div>
          </div>
        )}

        {/* Maintenance Modal */}
        {isMaintModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-[40px] p-10 w-full max-w-lg space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold italic tracking-tighter">Programar Service</h2>
                  <button onClick={() => setIsMaintModalOpen(false)}><X/></button>
                </div>
                <form onSubmit={handleAddMaintenance} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <select value={newMaint.tipoMantenimiento} onChange={e => setNewMaint({...newMaint, tipoMantenimiento: e.target.value})} className="border-b border-gray-200 py-2 outline-none font-bold text-sm bg-transparent">
                      <option value="CAMBIO_ACEITE">{t('maintenance.types.CAMBIO_ACEITE')}</option>
                      <option value="FRENOS">{t('maintenance.types.FRENOS')}</option>
                      <option value="MOTOR">{t('maintenance.types.MOTOR')}</option>
                      <option value="LLANTAS">{t('maintenance.types.LLANTAS')}</option>
                      <option value="SUSPENSION">{t('maintenance.types.SUSPENSION')}</option>
                      <option value="ELECTRICO">{t('maintenance.types.ELECTRICO')}</option>
                      <option value="TRANSMISION">{t('maintenance.types.TRANSMISION')}</option>
                      <option value="ESTETICO">{t('maintenance.types.ESTETICO')}</option>
                      <option value="GENERAL">{t('maintenance.types.GENERAL')}</option>
                      <option value="OTRO">{t('maintenance.types.OTRO')}</option>
                    </select>
                    <input type="number" placeholder={t('maintenance.cost_est')} value={newMaint.costoEstimado} onChange={e => setNewMaint({...newMaint, costoEstimado: parseInt(e.target.value)})} className="border-b border-gray-200 py-2 outline-none font-bold text-sm" />
                  </div>
                  <textarea placeholder={t('maintenance.description_placeholder')} value={newMaint.descripcion} onChange={e => setNewMaint({...newMaint, descripcion: e.target.value})} className="w-full h-32 border-b border-gray-200 outline-none resize-none text-sm" />
                  <button type="submit" disabled={submitting} className="kavak-button-primary w-full py-5 text-[10px] uppercase font-black tracking-widest">Crear Registro</button>
                </form>
             </motion.div>
          </div>
        )}

        {/* Item Modal (Gastos) */}
        {isItemModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-[40px] p-10 w-full max-w-sm space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold tracking-tight">Cargar Gasto</h2>
                  <button onClick={() => setIsItemModalOpen(false)}><X/></button>
                </div>
                <form onSubmit={handleAddItem} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">Descripción</label>
                    <input required value={newItem.descripcion} onChange={e => setNewItem({...newItem, descripcion: e.target.value})} className="w-full border-b border-gray-100 py-2 outline-none font-bold" placeholder="Eje. Filtro de Aceite" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400">Tipo</label>
                      <select value={newItem.tipo} onChange={e => setNewItem({...newItem, tipo: e.target.value as any})} className="w-full border-b border-gray-100 py-2 outline-none font-bold text-xs uppercase">
                        <option value="REPUESTO">Repuesto</option>
                        <option value="MANO_DE_OBRA">Mano de Obra</option>
                        <option value="OTRO">Otro</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400">Costo</label>
                       <input type="number" required value={newItem.costo} onChange={e => setNewItem({...newItem, costo: parseInt(e.target.value)})} className="w-full border-b border-gray-100 py-2 outline-none font-bold" />
                    </div>
                  </div>
                  <button type="submit" disabled={submitting} className="kavak-button-primary w-full py-5 text-[10px] uppercase font-black tracking-widest">Agregar Gasto</button>
                </form>
             </motion.div>
          </div>
        )}

        {/* Attachment Modal (File Upload) */}
        {isAttachmentModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-[40px] p-10 w-full max-w-sm space-y-8 text-center">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold tracking-tight text-left">Adjuntar Archivo</h2>
                  <button onClick={() => setIsAttachmentModalOpen(false)}><X/></button>
                </div>
                <form onSubmit={handleUploadFile} className="space-y-8">
                  <div className="border-2 border-dashed border-gray-100 rounded-[32px] p-10 flex flex-col items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer group relative">
                    <input type="file" required onChange={e => setNewAttachment({ file: e.target.files?.[0] || null })} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Upload className="w-12 h-12 text-gray-200 group-hover:text-primary transition-colors" />
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                       {newAttachment.file ? newAttachment.file.name : 'Click o arrastra archivo'}
                    </div>
                  </div>
                  <button type="submit" disabled={submitting || !newAttachment.file} className="kavak-button-primary w-full py-5 text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-2">
                    <Upload size={14} />
                    {submitting ? 'Subiendo...' : 'Subir Documento'}
                  </button>
                </form>
             </motion.div>
          </div>
        )}

        {/* Edit Vehicle Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-[40px] p-10 w-full max-w-md space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Editar Vehículo</h2>
                  <button onClick={() => setIsEditModalOpen(false)}><X/></button>
                </div>
                <form onSubmit={handleUpdateVehicle} className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <input placeholder="Marca" value={editVehicle.marca} onChange={e => setEditVehicle({...editVehicle, marca: e.target.value})} className="border-b border-gray-100 py-2 outline-none font-bold" />
                      <input placeholder="Modelo" value={editVehicle.modelo} onChange={e => setEditVehicle({...editVehicle, modelo: e.target.value})} className="border-b border-gray-100 py-2 outline-none font-bold" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <input placeholder="Patente" value={editVehicle.patente} onChange={e => setEditVehicle({...editVehicle, patente: e.target.value})} className="border-b border-gray-100 py-2 outline-none font-bold uppercase" />
                      <input placeholder="Año" type="number" value={editVehicle.anio} onChange={e => setEditVehicle({...editVehicle, anio: parseInt(e.target.value)})} className="border-b border-gray-100 py-2 outline-none font-bold" />
                   </div>
                   <button type="submit" disabled={submitting} className="kavak-button-primary w-full py-5 text-[10px] uppercase font-black tracking-widest">Guardar Cambios</button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
