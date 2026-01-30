import React from 'react';
import { StatusBadge } from './StatusBadge';
import { Wrench } from 'lucide-react';

interface MaintenanceItemProps {
  id: number;
  tipo: string;
  descripcion: string;
  fecha: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
  costo: number;
  onUpdateStatus?: (id: number, status: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO') => void;
}

export const MaintenanceItem: React.FC<MaintenanceItemProps> = ({
  id, tipo, descripcion, fecha, estado, costo, onUpdateStatus
}) => {
  const isFinal = estado === 'COMPLETADO' || estado === 'CANCELADO';

  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center">
        <div className="p-2 bg-surface border border-border rounded group-hover:border-primary transition-colors">
          <Wrench className="w-4 h-4 text-text-secondary group-hover:text-white" />
        </div>
        <div className="w-[1px] flex-grow bg-border my-2 last:hidden"></div>
      </div>
      
      <div className="flex-grow pb-8">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-tighter">{tipo}</span>
          <StatusBadge status={estado} />
        </div>
        <p className="text-sm text-gray-500 leading-snug">{descripcion}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-gray-400 font-mono italic">{new Date(fecha).toLocaleDateString()}</span>
            {costo > 0 && (
              <span className="text-[10px] font-bold text-gray-900 tracking-widest">$ {costo.toLocaleString()}</span>
            )}
          </div>
          
          {!isFinal && onUpdateStatus && (
            <div className="flex gap-2">
              {estado === 'PENDIENTE' && (
                <button 
                  onClick={() => onUpdateStatus(id, 'EN_PROCESO')}
                  className="text-[9px] font-black uppercase text-blue-600 hover:underline"
                >
                  Iniciar Taller
                </button>
              )}
              {estado === 'EN_PROCESO' && (
                <button 
                  onClick={() => onUpdateStatus(id, 'COMPLETADO')}
                  className="text-[9px] font-black uppercase text-green-600 hover:underline"
                >
                  Finalizar
                </button>
              )}
              <button 
                onClick={() => onUpdateStatus(id, 'CANCELADO')}
                className="text-[9px] font-black uppercase text-red-400 hover:underline"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
