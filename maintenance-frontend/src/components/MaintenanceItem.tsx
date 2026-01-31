import { StatusBadge } from './StatusBadge';
import { Wrench, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MaintenanceItemProps {
  id: number;
  tipo: string;
  descripcion: string;
  fecha: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
  costo: number;
  adjuntos?: { id: number; nombre: string; url: string }[];
  items?: { id: number; descripcion: string; tipo: 'REPUESTO' | 'MANO_DE_OBRA' | 'OTRO'; costo: number }[];
  onUpdateStatus?: (id: number, status: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO') => void;
  onDelete?: () => void;
  onAddAttachment?: (id: number) => void;
  onAddItem?: (id: number) => void;
}

export const MaintenanceItem: React.FC<MaintenanceItemProps> = ({
  id, tipo, descripcion, fecha, estado, costo, adjuntos, items, onUpdateStatus, onDelete, onAddAttachment, onAddItem
}) => {
  const { t } = useTranslation();
  const isFinal = estado === 'COMPLETADO' || estado === 'CANCELADO';

  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center">
        <div className="p-2 bg-white border border-gray-100 rounded-xl group-hover:border-primary transition-colors shadow-sm">
          <Wrench className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
        </div>
        <div className="w-[1px] flex-grow bg-gray-100 my-2 last:hidden"></div>
      </div>
      
      <div className="flex-grow pb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">
            {t(`maintenance.types.${tipo}`) || tipo}
          </span>
          <StatusBadge status={estado} />
        </div>
        <p className="text-base text-gray-700 font-medium leading-relaxed mb-4">{descripcion}</p>
        
        {/* Desglose de ítems */}
        {items && items.length > 0 && (
          <div className="bg-gray-50/50 rounded-2xl p-4 mb-6 space-y-3">
             <div className="flex items-center justify-between px-2">
               <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Desglose de Gasto</span>
             </div>
             <div className="space-y-2">
               {items.map(item => (
                 <div key={item.id} className="flex items-center justify-between text-xs px-2 py-1 hover:bg-white rounded-lg transition-colors">
                   <div className="flex items-center gap-3">
                     <span className={`w-1.5 h-1.5 rounded-full ${item.tipo === 'REPUESTO' ? 'bg-blue-400' : 'bg-green-400'}`}></span>
                     <span className="text-gray-600 font-medium">{item.descripcion}</span>
                   </div>
                   <span className="font-bold text-gray-900">$ {item.costo.toLocaleString()}</span>
                 </div>
               ))}
             </div>
          </div>
        )}

        <div className="flex items-start justify-between flex-wrap gap-6">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Fecha</span>
              <span className="text-sm font-bold text-gray-500">{new Date(fecha).toLocaleDateString()}</span>
            </div>
            {costo > 0 && (
              <div className="flex flex-col border-l border-gray-100 pl-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{estado === 'COMPLETADO' ? 'Inversión Total' : 'Costo Estimado'}</span>
                <span className="text-sm font-bold text-black tracking-tight">$ {costo.toLocaleString()}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-3 flex-grow">
            <div className="flex items-center gap-4">
              {!isFinal && onUpdateStatus && (
                <div className="flex gap-4">
                  {estado === 'PENDIENTE' && (
                    <button 
                      onClick={() => onUpdateStatus(id, 'EN_PROCESO')}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors"
                    >
                      {t('common.start_workshop')}
                    </button>
                  )}
                  {estado === 'EN_PROCESO' && (
                    <button 
                      onClick={() => onUpdateStatus(id, 'COMPLETADO')}
                      className="bg-green-50 text-green-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-100 transition-colors"
                    >
                      {t('common.finish')}
                    </button>
                  )}
                  <button 
                    onClick={() => onUpdateStatus(id, 'CANCELADO')}
                    className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              )}
              
              {!isFinal && onAddItem && (
                <button 
                  onClick={() => onAddItem(id)}
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                >
                  + Cargar Gasto
                </button>
              )}

              {onAddAttachment && (
                <button 
                  onClick={() => onAddAttachment(id)}
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                >
                  + {t('maintenance.add_doc') || 'Adjunto'}
                </button>
              )}
              
              {onDelete && (
                <button 
                  onClick={onDelete}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  title={t('common.delete')}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            
            {adjuntos && adjuntos.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-end">
                {adjuntos.map(a => (
                  <a 
                    key={a.id} 
                    href={a.url.startsWith('/api') ? `http://localhost:8080${a.url}` : a.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold bg-gray-100 text-gray-500 px-3 py-1.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 border border-transparent hover:border-primary/20"
                  >
                    <span className="truncate max-w-[150px]">{a.nombre}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
