import React, { useEffect, useState } from 'react';
import { getErrorMessage } from '../lib/utils';
import { toast } from 'sonner';
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
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completingMaintId, setCompletingMaintId] = useState<number | null>(null);
  const [finalCostInput, setFinalCostInput] = useState<string>('');
  
  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'VEHICLE' | 'MAINTENANCE', id?: number } | null>(null);

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
      toast.error(t('common.error_km_lower'));
      return;
    }
    try {
      setSubmitting(true);
      const response = await api.patch(`/vehicles/${vehicle.id}/mileage`, { nuevoKilometraje: newMileage });
      setVehicle(response.data);
      setIsMileageModalOpen(false);
    } catch (error: any) {
      console.error('Error updating mileage', error);
      toast.error(getErrorMessage(error, t('common.error_generic')));
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
    } catch (error: any) {
      console.error('Error adding maintenance', error);
      toast.error(getErrorMessage(error, t('common.error_generic')));
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
    } catch (error: any) {
      console.error('Error adding item', error);
      toast.error(getErrorMessage(error, t('common.error_generic')));
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
    } catch (error: any) {
      console.error('Error uploading file', error);
      toast.error(getErrorMessage(error, t('common.error_generic')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO') => {
    try {
      if (status === 'COMPLETADO') {
         const m = maintenances.find(item => item.id === id);
         if (!m.items || m.items.length === 0) {
            setCompletingMaintId(id);
            setFinalCostInput(m.costoEstimado ? m.costoEstimado.toString() : '0');
            setIsCompleteModalOpen(true);
            return;
         }
         await api.patch(`/maintenances/${id}/status`, { nuevoEstado: status, costoFinal: null });
      } else {
         await api.patch(`/maintenances/${id}/status`, { nuevoEstado: status });
      }
      fetchData();
    } catch (error: any) {
      console.error('Error updating status', error);
      toast.error(getErrorMessage(error));
    }
  };

  const handleConfirmCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingMaintId) return;
    try {
      setSubmitting(true);
      await api.patch(`/maintenances/${completingMaintId}/status`, { 
        nuevoEstado: 'COMPLETADO', 
        costoFinal: parseFloat(finalCostInput) 
      });
      setIsCompleteModalOpen(false);
      fetchData();
      toast.success(t('maintenance.success_message') || 'Service finalizado correctamente');
    } catch (error: any) {
       toast.error(getErrorMessage(error));
    } finally {
       setSubmitting(false);
    }
  };

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await api.put(`/vehicles/${id}`, editVehicle);
      setVehicle(response.data);
      setIsEditModalOpen(false);
      toast.success(t('common.success_update') || 'Vehículo actualizado');
    } catch (error: any) {
      console.error('Error updating vehicle', error);
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (type: 'VEHICLE' | 'MAINTENANCE', id?: number) => {
    setDeleteTarget({ type, id });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
        if (deleteTarget.type === 'VEHICLE') {
             await api.delete(`/vehicles/${id}`);
             navigate('/');
        } else if (deleteTarget.type === 'MAINTENANCE' && deleteTarget.id) {
             await api.delete(`/maintenances/${deleteTarget.id}`);
             fetchData();
        }
        setIsDeleteModalOpen(false);
        toast.success('Eliminado correctamente');
    } catch (error: any) {
        console.error('Error deleting', error);
        toast.error(getErrorMessage(error));
        setIsDeleteModalOpen(false); // Close on error too? Or keep open? black modal style usually closes.
    }
  };

  const handleDeleteMaintenance = (maintId: number) => {
      handleDeleteClick('MAINTENANCE', maintId);
  };
  
  const handleDeleteVehicle = () => {
      handleDeleteClick('VEHICLE');
  };

  if (loading || !vehicle) return <div className="min-h-screen flex items-center justify-center italic text-gray-400">{t('common.loading')}</div>;

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
                    <span className="bg-primary/10 text-primary text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">{t('vehicle_details.certified')}</span>
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
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">{t('vehicle_details.total_invested')}</span>
                   <div className="text-4xl font-bold tracking-tight">${totalCost.toLocaleString('es-AR')}</div>
                </div>
           </div>

           <div className="bg-black text-white p-8 rounded-[40px] flex flex-col justify-between gap-8 shadow-2xl">
              <div>
                <h3 className="text-xl font-bold italic tracking-tight">{t('common.expert_fleet')}</h3>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">{t('vehicle_details.quick_actions')}</p>
              </div>
              <div className="space-y-3">
                <button onClick={() => setIsMileageModalOpen(true)} className="w-full bg-white/10 hover:bg-white/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors">{t('vehicle_details.update_km')}</button>
                <button onClick={() => setIsMaintModalOpen(true)} className="w-full bg-primary hover:bg-primary/90 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20">{t('vehicle_details.schedule_service')}</button>
              </div>
           </div>
        </div>

        {/* History Section */}
        <section className="space-y-8 pt-8">
           <div className="flex items-center gap-4">
             <h2 className="text-2xl font-bold italic uppercase tracking-tighter">{t('vehicle_details.tech_history')}</h2>
             <div className="h-[1px] flex-grow bg-gray-200"></div>
           </div>
           
           <div className="space-y-4">
             {maintenances.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100 text-gray-300 italic">{t('vehicle_details.no_history')}</div>
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
                  <h2 className="text-2xl font-bold">{t('modals.update_km_title')}</h2>
                  <button onClick={() => setIsMileageModalOpen(false)}><X/></button>
                </div>
                <form onSubmit={handleUpdateMileage} className="space-y-6">
                  <input type="number" value={newMileage} onChange={e => setNewMileage(parseInt(e.target.value))} className="w-full text-5xl font-bold tracking-tighter border-b-2 border-gray-100 focus:border-primary outline-none py-2" />
                  <button type="submit" disabled={submitting} className="kavak-button-primary w-full py-5 text-[10px] uppercase font-black tracking-widest">{submitting ? t('modals.confirm_action') + '...' : t('modals.confirm_action')}</button>
                </form>
             </motion.div>
          </div>
        )}

        {/* Maintenance Modal */}
        {isMaintModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-[40px] p-10 w-full max-w-lg space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold italic tracking-tighter">{t('modals.schedule_service_title')}</h2>
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
                  <button type="submit" disabled={submitting} className="kavak-button-primary w-full py-5 text-[10px] uppercase font-black tracking-widest">{t('modals.create_record')}</button>
                </form>
             </motion.div>
          </div>
        )}

        {/* Item Modal (Gastos) */}
        {isItemModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-[40px] p-10 w-full max-w-sm space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold tracking-tight">{t('modals.add_expense_title')}</h2>
                  <button onClick={() => setIsItemModalOpen(false)}><X/></button>
                </div>
                <form onSubmit={handleAddItem} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">{t('modals.identification')}</label>
                    <input required value={newItem.descripcion} onChange={e => setNewItem({...newItem, descripcion: e.target.value})} className="w-full border-b border-gray-100 py-2 outline-none font-bold" placeholder="Eje. Filtro de Aceite" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400">{t('modals.type')}</label>
                      <select value={newItem.tipo} onChange={e => setNewItem({...newItem, tipo: e.target.value as any})} className="w-full border-b border-gray-100 py-2 outline-none font-bold text-xs uppercase">
                        <option value="REPUESTO">{t('modals.spare_part')}</option>
                        <option value="MANO_DE_OBRA">{t('modals.labor')}</option>
                        <option value="OTRO">{t('modals.other')}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400">{t('modals.cost')}</label>
                       <input type="number" required value={newItem.costo} onChange={e => setNewItem({...newItem, costo: parseInt(e.target.value)})} className="w-full border-b border-gray-100 py-2 outline-none font-bold" />
                    </div>
                  </div>
                  <button type="submit" disabled={submitting} className="kavak-button-primary w-full py-5 text-[10px] uppercase font-black tracking-widest">{t('modals.add_expense_btn')}</button>
                </form>
             </motion.div>
          </div>
        )}

        {/* Attachment Modal (File Upload) */}
        {isAttachmentModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-[40px] p-10 w-full max-w-sm space-y-8 text-center">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold tracking-tight text-left">{t('modals.upload_file_title')}</h2>
                  <button onClick={() => setIsAttachmentModalOpen(false)}><X/></button>
                </div>
                <form onSubmit={handleUploadFile} className="space-y-8">
                  <div className="border-2 border-dashed border-gray-100 rounded-[32px] p-10 flex flex-col items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer group relative">
                    <input type="file" required onChange={e => setNewAttachment({ file: e.target.files?.[0] || null })} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Upload className="w-12 h-12 text-gray-200 group-hover:text-primary transition-colors" />
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                       {newAttachment.file ? newAttachment.file.name : t('modals.drag_drop')}
                    </div>
                  </div>
                  <button type="submit" disabled={submitting || !newAttachment.file} className="kavak-button-primary w-full py-5 text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-2">
                    <Upload size={14} />
                    {submitting ? t('modals.uploading') : t('modals.upload_btn')}
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
                  <h2 className="text-2xl font-bold">{t('modals.edit_vehicle_title')}</h2>
                  <button onClick={() => setIsEditModalOpen(false)}><X/></button>
                </div>
                <form onSubmit={handleUpdateVehicle} className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <input placeholder={t('modals.brand')} value={editVehicle.marca} onChange={e => setEditVehicle({...editVehicle, marca: e.target.value})} className="border-b border-gray-100 py-2 outline-none font-bold" />
                      <input placeholder={t('modals.model')} value={editVehicle.modelo} onChange={e => setEditVehicle({...editVehicle, modelo: e.target.value})} className="border-b border-gray-100 py-2 outline-none font-bold" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <input placeholder={t('modals.identification')} value={editVehicle.patente} onChange={e => setEditVehicle({...editVehicle, patente: e.target.value})} className="border-b border-gray-100 py-2 outline-none font-bold uppercase" />
                      <input placeholder={t('modals.manufacture_year')} type="number" value={editVehicle.anio} onChange={e => setEditVehicle({...editVehicle, anio: parseInt(e.target.value)})} className="border-b border-gray-100 py-2 outline-none font-bold" />
                   </div>
                   <button type="submit" disabled={submitting} className="kavak-button-primary w-full py-5 text-[10px] uppercase font-black tracking-widest">{t('modals.save_changes')}</button>
                </form>
             </motion.div>
          </div>
        )}

        {/* Confirm Completion Modal */}
        {isCompleteModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-[40px] p-10 w-full max-w-sm space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold tracking-tight">{t('modals.finish_service_title')}</h2>
                  <button onClick={() => setIsCompleteModalOpen(false)}><X/></button>
                </div>
                <div className="text-sm text-gray-500 font-medium">
                   {t('modals.no_expenses_warning')}
                </div>
                <form onSubmit={handleConfirmCompletion} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400">{t('modals.final_cost_real')}</label>
                      <div className="flex items-center gap-2 border-b-2 border-gray-100 py-2 focus-within:border-primary transition-colors">
                         <span className="text-xl font-bold text-gray-400">$</span>
                         <input 
                           type="number" 
                           required 
                           autoFocus
                           value={finalCostInput} 
                           onChange={e => setFinalCostInput(e.target.value)} 
                           className="w-full outline-none text-3xl font-bold tracking-tight" 
                         />
                      </div>
                   </div>
                   <button type="submit" disabled={submitting} className="kavak-button-primary w-full py-5 text-[10px] uppercase font-black tracking-widest">
                      {submitting ? t('modals.finishing') : t('modals.finish_confirm')}
                   </button>
                </form>
             </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-[40px] p-10 w-full max-w-sm space-y-8 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 mb-4">
                   <X size={32} />
                </div>
                <div className="space-y-2">
                   <h2 className="text-2xl font-bold tracking-tight">{t('modals.delete_title')}</h2>
                   <p className="text-sm text-gray-500 font-medium">
                     {deleteTarget?.type === 'VEHICLE' ? t('modals.delete_vehicle_desc') : t('modals.delete_maintenance_desc')}
                   </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => setIsDeleteModalOpen(false)} className="kavak-button-ghost py-4 text-[10px] font-black uppercase tracking-widest">{t('common.cancel')}</button>
                   <button onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600 text-white rounded-2xl py-4 text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-red-500/20">
                     {t('modals.delete_confirm')}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
