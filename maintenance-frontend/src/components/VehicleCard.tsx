import React from 'react';
import { ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { getVehicleImage } from '../utils/vehicle';

interface VehicleProps {
  id: number;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  kilometrajeActual: number;
  isAvailable: boolean;
  imageUrl?: string;
}

export const VehicleCard: React.FC<VehicleProps> = ({ 
  patente, marca, modelo, anio, kilometrajeActual, isAvailable, imageUrl 
}) => {
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
          <div className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Sin Imagen</div>
        )}
        <div className={clsx(
          "absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
          isAvailable ? "bg-white text-green-600" : "bg-white text-orange-600"
        )}>
          {isAvailable ? 'Disponible' : 'En Taller'}
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
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Patente</span>
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
