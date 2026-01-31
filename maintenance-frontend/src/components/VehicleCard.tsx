import { ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { getVehicleImage } from '../utils/vehicle';
import { useTranslation } from 'react-i18next';

interface VehicleProps {
  id: number;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  kilometrajeActual: number;
  proximoMantenimientoKm: number;
  requiereMantenimiento: boolean;
  isAvailable: boolean;
  imageUrl?: string;
}

export const VehicleCard: React.FC<VehicleProps> = ({ 
  patente, marca, modelo, anio, kilometrajeActual, proximoMantenimientoKm, requiereMantenimiento, isAvailable, imageUrl 
}) => {
  const { t } = useTranslation();
  const resolvedImage = imageUrl || getVehicleImage(marca, modelo);

  return (
    <div className="kavak-card overflow-hidden cursor-pointer group">
      <div className="aspect-video sm:aspect-[4/3] bg-gray-100 flex items-center justify-center relative overflow-hidden">
        {resolvedImage ? (
          <img 
            src={resolvedImage} 
            alt={`${marca} ${modelo}`} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{t('common.no_image')}</div>
        )}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2 pointer-events-none">
          <div className={clsx(
            "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm pointer-events-auto",
            isAvailable ? "bg-white text-green-600" : "bg-white text-orange-600"
          )}>
            {isAvailable ? t('home.status_available') : t('home.status_in_service')}
          </div>

          {requiereMantenimiento && (
            <div className="px-2.5 py-1 bg-red-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse shadow-xl shadow-red-500/40 pointer-events-auto">
              {t('home.maintenance_alert')}
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {marca} {modelo}
          </h3>
          <p className="text-sm text-gray-500">
            {anio} • {kilometrajeActual.toLocaleString()} km • Manual
          </p>
        </div>

        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('common.plate')}</span>
            <p className="text-sm font-semibold text-gray-700 font-mono tracking-widest uppercase">{patente}</p>
          </div>
          <button className="p-2 bg-gray-50 rounded-full text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
